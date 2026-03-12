import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';


import AddItemModal from "../components/AddItemModal";
import { fetchWithAuth } from "../utils/api";
import EditItemModal from "../components/EditItemModal";
import ViewItemModal from "../components/ViewItemModal";
import DiscussionBoard from "../components/DiscussionBoard";

// --- DND HELPER COMPONENT ---
function SortableField({ id, label, value, onChange }: { id: string, label: string, value: string, onChange: (id: string, val: string) => void }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const style = { transform: CSS.Transform.toString(transform), transition };
    
    return (
        <div ref={setNodeRef} style={style} className="d-flex align-items-center mb-2 bg-light p-2 border rounded">
            <span {...attributes} {...listeners} className="me-3 text-muted" style={{cursor: 'grab'}}>
                <i className="bi bi-grip-vertical"></i>
            </span>
            <span className="me-3 fw-bold" style={{width: '100px'}}>{label}</span>
            <input 
                type="text" 
                className="form-control" 
                placeholder="Field Display Name (leave blank to hide)" 
                value={value || ''} 
                onChange={e => onChange(id, e.target.value)} 
            />
        </div>
    );
}

// --- MAIN COMPONENT ---
export default function InventoryDetails() {
    const { id } = useParams();
    const [inventory, setInventory] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // 🟢 Tabs & Modals State
    const [activeTab, setActiveTab] = useState('items');
    const [showAddItemModal, setShowAddItemModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    
    // 🟢 Items Selection State
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [itemToView, setItemToView] = useState<any>(null);

    // 🟢 Auto-Save State
    const [formData, setFormData] = useState<any>({});
    const [isDirty, setIsDirty] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // 🟢 Access Management State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);

    // 🟢 Custom Fields DnD State
    const [customFields, setCustomFields] = useState<{id: string, label: string, value: string}[]>([]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const userString = localStorage.getItem('user');
    const currentUser = userString ? JSON.parse(userString) : null;
    const currentUserId = currentUser ? Number(currentUser.id) : null;
    const isOwnerOrAdmin = inventory && (currentUserId === inventory.userId || currentUser?.role === 'Admin');
    const hasWriteAccess = isOwnerOrAdmin || inventory?.isPublic || inventory?.allowedUsers?.some((u: any) => u.id === currentUserId);
    
    const fetchInventory = useCallback(() => {
        fetchWithAuth(`https://inventorymanager-c0d3cbfwfxd9dwd8.canadacentral-01.azurewebsites.net/api/inventories/${id}?t=${new Date().getTime()}`)
            .then(res => {
                if (!res.ok) throw new Error("Inventory not found");
                return res.json();
            })
            .then(data => {
                setInventory(data);
                setFormData(data);
                setIsLoading(false);
                setSelectedItems([]);
                
                // Initialize sortable fields
                setCustomFields([
                    { id: 'string1Name', label: 'String 1', value: data.string1Name },
                    { id: 'string2Name', label: 'String 2', value: data.string2Name },
                    { id: 'string3Name', label: 'String 3', value: data.string3Name },
                    { id: 'number1Name', label: 'Number 1', value: data.number1Name },
                    { id: 'number2Name', label: 'Number 2', value: data.number2Name },
                    { id: 'number3Name', label: 'Number 3', value: data.number3Name },
                    { id: 'text1Name', label: 'Text 1', value: data.text1Name },
                    { id: 'text2Name', label: 'Text 2', value: data.text2Name },
                    { id: 'text3Name', label: 'Text 3', value: data.text3Name },
                ]);
            })
            .catch(err => {
                console.error(err);
                setIsLoading(false);
            });
    }, [id]);

    useEffect(() => { fetchInventory(); }, [fetchInventory]);

    // 🟢 Auto-Save Effect (Fires every 8 seconds if dirty)
    useEffect(() => {
        const timer = setInterval(() => {
            if (isDirty && formData && isOwnerOrAdmin) {
                fetchWithAuth(`https://inventorymanager-c0d3cbfwfxd9dwd8.canadacentral-01.azurewebsites.net/api/inventories/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                })
                .then(res => {
                    if (res.status === 409) {
                        alert("Conflict! Someone else modified this inventory. Please refresh.");
                        setIsDirty(false);
                    } else if (res.ok) {
                        setIsDirty(false);
                        setLastSaved(new Date());
                    }
                })
                .catch(err => console.error("Auto-save failed", err));
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [isDirty, formData, id, isOwnerOrAdmin]);

    const handleGrantAccess = async (targetUserId: number) => {
        try {
            const res = await fetchWithAuth(`https://inventorymanager-c0d3cbfwfxd9dwd8.canadacentral-01.azurewebsites.net/api/inventories/${id}/access/${targetUserId}`, { method: 'POST' });
            if (res.ok) {
                setSearchResults([]); // Clear search box
                setSearchQuery('');
                fetchInventory(); // Refresh to show new user in the list
            }
        } catch (error) { console.error(error); }
    };

    // 🟢 Handle Removing Access
    const handleRevokeAccess = async (targetUserId: number) => {
        try {
            const res = await fetchWithAuth(`https://inventorymanager-c0d3cbfwfxd9dwd8.canadacentral-01.azurewebsites.net/api/inventories/${id}/access/${targetUserId}`, { method: 'DELETE' });
            if (res.ok) fetchInventory(); // Refresh to remove user from list
        } catch (error) { console.error(error); }
    };
    
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData((prev: any) => ({ ...prev, [name]: val }));
        setIsDirty(true);
    };

    const handleFieldDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setCustomFields((items) => {
                const oldIndex = items.findIndex(i => i.id === active.id);
                const newIndex = items.findIndex(i => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
            setIsDirty(true);
        }
    };

    const handleFieldChange = (fieldId: string, newValue: string) => {
        setCustomFields(prev => prev.map(f => f.id === fieldId ? { ...f, value: newValue } : f));
        setFormData((prev: any) => ({ ...prev, [fieldId]: newValue }));
        setIsDirty(true);
    };

    const handleUserSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.length > 2) {
            const res = await fetchWithAuth(`https://inventorymanager-c0d3cbfwfxd9dwd8.canadacentral-01.azurewebsites.net/api/users/search?query=${query}`);
            if (res.ok) setSearchResults(await res.json());
        } else {
            setSearchResults([]);
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedItems.length === 0) return;
        if (!window.confirm(`Are you sure you want to delete ${selectedItems.length} selected item(s)?`)) return;

        try {
            for (const itemId of selectedItems) {
                await fetchWithAuth(`https://inventorymanager-c0d3cbfwfxd9dwd8.canadacentral-01.azurewebsites.net/api/items/${itemId}`, { method: 'DELETE' });
            }
            setSelectedItems([]);
            fetchInventory();
        } catch (error) {
            console.error("Error deleting items:", error);
        }
    };

    const handleLikeToggle = async (itemId: number) => {
        try {
            const res = await fetchWithAuth(`https://inventorymanager-c0d3cbfwfxd9dwd8.canadacentral-01.azurewebsites.net/api/items/${itemId}/toggle-like`, { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                setInventory((prev: any) => ({
                    ...prev,
                    items: prev.items.map((item: any) => item.id === itemId ? { ...item, totalLikes: data.totalLikes, currentUserLiked: data.isLiked } : item)
                }));
            }
        } catch (error) { console.error("Error toggling like:", error); }
    };

    const getDynamicColumns = () => {
        if (!inventory) return [];
        const cols = [ { key: 'customId', label: 'ID' }, { key: 'name', label: 'Item Name' } ];
        customFields.forEach(field => {
            if (field.value) cols.push({ key: field.id.replace('Name', 'Value'), label: field.value });
        });
        return cols;
    };

    if (isLoading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;
    if (!inventory) return <div className="text-center mt-5"><h3>Inventory not found!</h3><Link to="/">Go Home</Link></div>;

    const columns = getDynamicColumns();

    return (
        <div className="container mt-5 mb-5">
            {/* Header Section */}
            <div className="d-flex align-items-start mb-4">
                {inventory.imageUrl && (
                    <img src={inventory.imageUrl} alt={inventory.title} className="rounded shadow-sm object-fit-cover me-4" style={{ width: '120px', height: '120px' }} />
                )}
                <div className="flex-grow-1">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-1">
                            <li className="breadcrumb-item"><Link to="/">Dashboard</Link></li>
                            <li className="breadcrumb-item active">{inventory.title}</li>
                        </ol>
                    </nav>
                    <div className="d-flex justify-content-between align-items-center">
                        <h1 className="display-6 fw-bold mb-0">{inventory.title}</h1>
                        {isOwnerOrAdmin && (
                            <div className="text-end">
                                {isDirty ? <span className="badge bg-warning text-dark"><i className="bi bi-arrow-repeat spin"></i> Unsaved Changes</span> 
                                         : <span className="badge bg-success"><i className="bi bi-cloud-check"></i> Saved</span>}
                                {lastSaved && <div className="text-muted" style={{fontSize: '0.8rem'}}>Last auto-save: {lastSaved.toLocaleTimeString()}</div>}
                            </div>
                        )}
                    </div>
                    <span className="badge bg-secondary me-2">{inventory.category}</span>
                    {inventory.isPublic ? <span className="badge bg-info text-dark">Public</span> : <span className="badge bg-dark">Private</span>}
                </div>
            </div>

            {/* 🟢 ROLE-BASED TABS */}
            <ul className="nav nav-tabs mb-4">
                <li className="nav-item"><button className={`nav-link fw-bold ${activeTab === 'items' ? 'active' : ''}`} onClick={() => setActiveTab('items')}>Items</button></li>
                <li className="nav-item"><button className={`nav-link fw-bold ${activeTab === 'discussion' ? 'active' : ''}`} onClick={() => setActiveTab('discussion')}>Discussion</button></li>
                
                {isOwnerOrAdmin && (
                    <>
                        <li className="nav-item"><button className={`nav-link ${activeTab === 'settings' ? 'active text-primary fw-bold' : 'text-muted'}`} onClick={() => setActiveTab('settings')}>Settings</button></li>
                        <li className="nav-item"><button className={`nav-link ${activeTab === 'fields' ? 'active text-primary fw-bold' : 'text-muted'}`} onClick={() => setActiveTab('fields')}>Custom Fields</button></li>
                        <li className="nav-item"><button className={`nav-link ${activeTab === 'access' ? 'active text-primary fw-bold' : 'text-muted'}`} onClick={() => setActiveTab('access')}>Access Control</button></li>
                        <li className="nav-item"><button className={`nav-link ${activeTab === 'stats' ? 'active text-primary fw-bold' : 'text-muted'}`} onClick={() => setActiveTab('stats')}>Statistics</button></li>
                    </>
                )}
            </ul>

            {/* --- TAB CONTENT --- */}
            
            {/* TAB 1: ITEMS */}
            {activeTab === 'items' && (
                <>
                    {/* The Items Toolbar */}
                    {hasWriteAccess && (
                        <div className="mb-3 p-2 bg-light border rounded d-flex gap-2">
                            <button className="btn btn-primary" onClick={() => setShowAddItemModal(true)}>+ Add New Item</button>
                            <button className="btn btn-warning" disabled={selectedItems.length !== 1} onClick={() => setShowEditModal(true)}>Edit Selected</button>
                            <button className="btn btn-danger" disabled={selectedItems.length === 0} onClick={handleDeleteSelected}>Delete Selected</button>
                        </div>
                    )}

                    <div className="card shadow-sm border-0">
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover mb-0 align-middle">
                                    <thead className="table-dark">
                                        <tr>
                                            <th style={{ width: '50px' }} className="text-center">☑</th>
                                            {columns.map(col => <th key={col.key}>{col.label}</th>)}
                                            <th>Likes</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {inventory.items.length === 0 ? (
                                            <tr><td colSpan={columns.length + 2} className="text-center py-5 text-muted">📭 This inventory is empty</td></tr>
                                        ) : (
                                            inventory.items.map((item: any) => (
                                                <tr key={item.id} className={selectedItems.includes(item.id) ? "table-primary" : ""}>
                                                    <td className="text-center">
                                                        <input 
                                                            className="form-check-input border-secondary" 
                                                            type="checkbox" 
                                                            checked={selectedItems.includes(item.id)}
                                                            onChange={() => setSelectedItems(prev => prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id])}
                                                        />
                                                    </td>
                                                    {columns.map(col => (
                                                        <td key={col.key}>
                                                            {col.key === 'name' ? (
                                                                <span className="fw-bold text-primary text-decoration-underline" style={{cursor: "pointer"}} onClick={() => { setItemToView(item); setShowViewModal(true); }}>
                                                                    {String(item[col.key])}
                                                                </span>
                                                            ) : (
                                                                item[col.key] !== null && item[col.key] !== undefined && item[col.key] !== "" ? String(item[col.key]) : "—"
                                                            )}
                                                        </td>
                                                    ))}
                                                    <td>
                                                        <button className={`btn btn-sm ${item.currentUserLiked ? 'btn-danger' : 'btn-outline-danger'}`} onClick={() => handleLikeToggle(item.id)}>
                                                            <i className={`bi ${item.currentUserLiked ? 'bi-heart-fill' : 'bi-heart'}`}></i> {item.totalLikes || 0}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* TAB 2: DISCUSSION */}
            {activeTab === 'discussion' && <DiscussionBoard inventoryId={inventory.id} />}

            {/* TAB 3: SETTINGS (Owner/Admin Only) */}
            {activeTab === 'settings' && isOwnerOrAdmin && (
                <div className="row">
                    <div className="col-md-8">
                        <div className="card shadow-sm border-0 p-4">
                            <h4 className="mb-4">General Settings</h4>
                            <div className="mb-3">
                                <label className="form-label fw-bold">Title</label>
                                <input type="text" name="title" className="form-control" value={formData.title || ''} onChange={handleFormChange} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-bold">Description (Markdown Supported)</label>
                                <textarea name="description" className="form-control" rows={4} value={formData.description || ''} onChange={handleFormChange} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-bold">Custom ID Template</label>
                                <input type="text" name="customIdTemplate" className="form-control font-monospace" value={formData.customIdTemplate || ''} onChange={handleFormChange} />
                                <small className="text-muted">Changes here will only apply to newly created items.</small>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 4: CUSTOM FIELDS (Owner/Admin Only) */}
            {activeTab === 'fields' && isOwnerOrAdmin && (
                <div className="row">
                    <div className="col-md-8">
                        <div className="card shadow-sm border-0 p-4">
                            <h4 className="mb-4">Manage Custom Fields</h4>
                            <p className="text-muted">Drag and drop to reorder how fields are displayed in the table. Changes auto-save.</p>
                            
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleFieldDragEnd}>
                                <SortableContext items={customFields.map(f => f.id)} strategy={verticalListSortingStrategy}>
                                    {customFields.map(field => (
                                        <SortableField key={field.id} id={field.id} label={field.label} value={field.value} onChange={handleFieldChange} />
                                    ))}
                                </SortableContext>
                            </DndContext>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 5: ACCESS CONTROL (Owner/Admin Only) */}
          {/* TAB 5: ACCESS CONTROL (Owner/Admin Only) */}
            {activeTab === 'access' && isOwnerOrAdmin && (
                <div className="row">
                    <div className="col-md-6">
                        <div className="card shadow-sm border-0 p-4 mb-4">
                            <h4 className="mb-3">Visibility</h4>
                            <div className="form-check form-switch fs-5">
                                <input className="form-check-input" type="checkbox" name="isPublic" checked={formData.isPublic || false} onChange={handleFormChange} />
                                <label className="form-check-label ms-2">Public Inventory</label>
                            </div>
                            <small className="text-muted d-block mt-2">If public, any registered user can add and edit items.</small>
                        </div>

                        {!formData.isPublic && (
                            <div className="card shadow-sm border-0 p-4">
                                <h4 className="mb-3">Grant Write Access</h4>
                                <input type="text" className="form-control mb-3" placeholder="Search users by name or email..." value={searchQuery} onChange={handleUserSearch} />
                                
                                {/* Search Results */}
                                {searchResults.length > 0 && (
                                    <ul className="list-group mb-4">
                                        {searchResults.map(u => (
                                            <li key={`search-${u.id}`} className="list-group-item d-flex justify-content-between align-items-center bg-light">
                                                <span><i className="bi bi-person me-2"></i>{u.username} <small className="text-muted">({u.email})</small></span>
                                                <button type="button" className="btn btn-sm btn-success" onClick={() => handleGrantAccess(u.id)}>+ Add</button>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {/* Current Allowed Users */}
                                <h5 className="mt-4 border-bottom pb-2">Users with Access</h5>
                                {inventory?.allowedUsers?.length === 0 ? (
                                    <p className="text-muted mt-2">No specific users have been granted access yet.</p>
                                ) : (
                                    <ul className="list-group">
                                        {inventory?.allowedUsers?.map((u: any) => (
                                            <li key={`allowed-${u.id}`} className="list-group-item d-flex justify-content-between align-items-center">
                                                <span><i className="bi bi-person-check-fill text-primary me-2"></i>{u.username}</span>
                                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleRevokeAccess(u.id)}>
                                                    <i className="bi bi-x-lg"></i> Remove
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 6: STATISTICS (Owner/Admin Only) */}
            {activeTab === 'stats' && isOwnerOrAdmin && (
                <div className="card shadow-sm border-0 p-4">
                    <h4 className="mb-4">Inventory Statistics</h4>
                    <div className="row text-center">
                        <div className="col-md-4 mb-3">
                            <div className="p-3 bg-light rounded border">
                                <h3>{inventory.items.length}</h3>
                                <span className="text-muted">Total Items</span>
                            </div>
                        </div>
                        <div className="col-md-4 mb-3">
                            <div className="p-3 bg-light rounded border">
                                <h3>{inventory.items.reduce((acc: number, item: any) => acc + (item.totalLikes || 0), 0)}</h3>
                                <span className="text-muted">Total Likes</span>
                            </div>
                        </div>
                        <div className="col-md-4 mb-3">
                            <div className="p-3 bg-light rounded border">
                                <h3>{customFields.filter(f => f.value).length}</h3>
                                <span className="text-muted">Active Custom Fields</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modals */}
            <AddItemModal show={showAddItemModal} onClose={() => setShowAddItemModal(false)} onSuccess={fetchInventory} inventory={inventory} />
            <EditItemModal show={showEditModal} onClose={() => setShowEditModal(false)} onSuccess={() => { fetchInventory(); setSelectedItems([]); }} inventory={inventory} item={inventory.items.find((i: any) => i.id === selectedItems[0]) || null} />
            {itemToView && <ViewItemModal show={showViewModal} onClose={() => { setShowViewModal(false); setItemToView(null); }} inventory={inventory} item={itemToView} />}
        </div>
    );
}