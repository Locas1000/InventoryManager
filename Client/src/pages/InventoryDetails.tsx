import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import AddItemModal from "../components/AddItemModal";
import { fetchWithAuth } from "../utils/api";
import EditItemModal from "../components/EditItemModal";
import ViewItemModal from "../components/ViewItemModal";
import DiscussionBoard from "../components/DiscussionBoard";
interface Item {
    id: number;
    customId: string;
    [key: string]: string | number | boolean | null | undefined;
    string1Value: string | null;
    string2Value: string | null;
    string3Value: string | null;
    number1Value: number | null;
    totalLikes?: number;
    currentUserLiked?: boolean;
    userId: number;
}

interface Inventory {
    id: number;
    title: string;
    description: string;
    category: string;
    tags?: string[];
    customIdTemplate: string;
    string1Name: string | null;
    string2Name: string | null;
    string3Name: string | null;
    number1Name: string | null;
    number2Name?: string | null;
    number3Name?: string | null;
    text1Name?: string | null;
    text2Name?: string | null;
    text3Name?: string | null;
    bool1Name?: string | null;
    bool2Name?: string | null;
    bool3Name?: string | null;
    items: Item[];
    imageUrl?: string | null;
    userId: number;
}

export default function InventoryDetails() {
    const { id } = useParams();
    const [inventory, setInventory] = useState<Inventory | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddItemModal, setShowAddItemModal] = useState(false);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [itemToView, setItemToView] = useState<Item | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const userString = localStorage.getItem('user');
    const currentUser = userString ? JSON.parse(userString) : null;
    const currentUserId = currentUser ? Number(currentUser.id) : null;
    // An admin or the inventory owner has write access
    const hasWriteAccess = inventory && (currentUserId === inventory.userId || !!currentUser?.isAdmin);
    const fetchInventory = useCallback(() => {
        fetchWithAuth(`https://inventorymanager-c0d3cbfwfxd9dwd8.canadacentral-01.azurewebsites.net/api/inventories/${id}`)
            .then(res => {
                if (!res.ok) throw new Error("Inventory not found");
                return res.json();
            })
            .then(data => {
                setInventory(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                setIsLoading(false);
            });
    }, [id]);

    useEffect(() => {
        fetchInventory();
    }, [fetchInventory]);

    const handleDeleteSelected = async () => {
        if (selectedItems.length === 0) return;
        if (!window.confirm(`Are you sure you want to delete ${selectedItems.length} selected item(s)?`)) return;

        try {
            const deletePromises = selectedItems.map(itemId =>
                fetchWithAuth(`https://inventorymanager-c0d3cbfwfxd9dwd8.canadacentral-01.azurewebsites.net/api/items/${itemId}`, {
                    method: 'DELETE',
                })
            );
            const responses = await Promise.all(deletePromises);

            if (responses.every(res => res.ok)) {
                setSelectedItems([]);
                fetchInventory();
            } else {
                alert("Failed to delete one or more items.");
            }
        } catch (error) {
            console.error("Error deleting items:", error);
        }
    };

    const handleLikeToggle = async (itemId: number) => {
        try {
            const response = await fetchWithAuth(`https://inventorymanager-c0d3cbfwfxd9dwd8.canadacentral-01.azurewebsites.net/api/items/${itemId}/toggle-like`, {
                method: 'POST',
            });
            if (response.ok) {
                const data = await response.json();
                setInventory(prev => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        items: prev.items.map(item =>
                            item.id === itemId
                                ? { ...item, totalLikes: data.totalLikes, currentUserLiked: data.isLiked }
                                : item
                        )
                    };
                });
            }
        } catch (error) {
            console.error("Error toggling like:", error);
        }
    };

    const getDynamicColumns = () => {
        if (!inventory) return [];
        const columns = [
            { key: 'customId', label: 'ID' },
            { key: 'name', label: 'Item Name' }
        ];

        if (inventory.string1Name) columns.push({ key: 'string1Value', label: inventory.string1Name });
        if (inventory.string2Name) columns.push({ key: 'string2Value', label: inventory.string2Name });
        if (inventory.string3Name) columns.push({ key: 'string3Value', label: inventory.string3Name });
        if (inventory.number1Name) columns.push({ key: 'number1Value', label: inventory.number1Name });
        if (inventory.number2Name) columns.push({ key: 'number2Value', label: inventory.number2Name });
        if (inventory.number3Name) columns.push({ key: 'number3Value', label: inventory.number3Name });
        if (inventory.text1Name) columns.push({ key: 'text1Value', label: inventory.text1Name });
        if (inventory.text2Name) columns.push({ key: 'text2Value', label: inventory.text2Name });
        if (inventory.text3Name) columns.push({ key: 'text3Value', label: inventory.text3Name });
        if (inventory.bool1Name) columns.push({ key: 'bool1Value', label: inventory.bool1Name });
        if (inventory.bool2Name) columns.push({ key: 'bool2Value', label: inventory.bool2Name });
        if (inventory.bool3Name) columns.push({ key: 'bool3Value', label: inventory.bool3Name });

        return columns;
    };

    if (isLoading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;
    if (!inventory) return <div className="text-center mt-5"><h3>Inventory not found!</h3><Link to="/">Go Home</Link></div>;

    const columns = getDynamicColumns();

    return (
        <div className="container mt-5">
            <div className="d-flex flex-column flex-lg-row justify-content-lg-between align-items-lg-start mb-4">
                <div className="d-flex gap-4 align-items-start mb-3 mb-lg-0">
                    {inventory.imageUrl && (
                        <img
                            src={inventory.imageUrl}
                            alt={inventory.title}
                            className="rounded shadow-sm object-fit-cover"
                            style={{ width: '150px', height: '150px' }}
                        />
                    )}
                    <div>
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb mb-1">
                                <li className="breadcrumb-item"><Link to="/">Dashboard</Link></li>
                                <li className="breadcrumb-item active" aria-current="page">{inventory.title}</li>
                            </ol>
                        </nav>
                        <h1 className="display-6 fw-bold">{inventory.title}</h1>
                        <span className="badge bg-secondary me-2">{inventory.category}</span>
                        {inventory.tags && inventory.tags.map(tag => (
                            <span key={tag} className="badge bg-info text-dark me-2 fs-6 shadow-sm">
                                    <i className="bi bi-tag-fill me-1 opacity-75"></i>
                                {tag}
                                </span>
                        ))}
                        <p className="text-muted mt-2">{inventory.description}</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="d-flex flex-wrap justify-content-start justify-content-lg-end gap-2">
                    {hasWriteAccess && (
                        <>
                            <button
                                className="btn btn-outline-primary"
                                disabled={selectedItems.length !== 1}
                                onClick={() => setShowEditModal(true)}
                            >
                                <i className="bi bi-pencil me-1"></i> Edit Selected
                            </button>
                            <button
                                className="btn btn-outline-danger"
                                disabled={selectedItems.length === 0}
                                onClick={handleDeleteSelected}
                            >
                                <i className="bi bi-trash me-1"></i> Delete Selected
                            </button>
                            <button
                                className="btn btn-primary text-nowrap"
                                onClick={() => setShowAddItemModal(true)}
                            >
                                <i className="bi bi-plus-lg me-1"></i> Add New Item
                            </button>
                        </>
                    )}
                </div>
            </div>


            <div className="card shadow-sm border-0">
                <div className="card-body p-0">
                    <table className="table table-hover mb-0 align-middle">
                        <thead className="table-light">
                        <tr>
                            <th style={{ width: '40px' }}>
                                <div className="form-check d-flex justify-content-center">
                                    <input
                                        className="form-check-input border-secondary"
                                        type="checkbox"
                                        style={{ cursor: "pointer" }}
                                        disabled={inventory.items.length === 0}
                                        checked={inventory.items.length > 0 && selectedItems.length === inventory.items.length}
                                        onChange={() => {
                                            if (selectedItems.length === inventory.items.length) setSelectedItems([]);
                                            else setSelectedItems(inventory.items.map(i => i.id));
                                        }}
                                    />
                                </div>
                            </th>

                            {columns.map(col => (
                                <th key={col.key}>{col.label}</th>
                            ))}
                            <th>Likes</th>
                        </tr>
                        </thead>
                        <tbody>

                        {inventory.items.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + 2} className="text-center py-5 text-muted">
                                    <h4>📭 This inventory is empty</h4>
                                    <p>Click the blue button to add your first item!</p>
                                </td>
                            </tr>
                        ) : (
                            inventory.items.map(item => (
                                <tr
                                    key={item.id}
                                    className={selectedItems.includes(item.id) ? "table-primary" : ""}
                                >
                                    <td>
                                        <div className="form-check d-flex justify-content-center">
                                            <input
                                                className="form-check-input border-secondary"
                                                type="checkbox"
                                                style={{ cursor: "pointer", width: '1.2rem', height: '1.2rem' }}
                                                checked={selectedItems.includes(item.id)}
                                                onChange={() => {
                                                    setSelectedItems(prev =>
                                                        prev.includes(item.id)
                                                            ? prev.filter(id => id !== item.id)
                                                            : [...prev, item.id]
                                                    );
                                                }}
                                            />
                                        </div>
                                    </td>

                                    {/* Dynamic Data Columns */}
                                    {columns.map(col => (
                                        <td key={col.key}>
                                            {col.key === 'customId' ? (
                                                <span className="fw-bold font-monospace text-primary">{item.customId}
                                                </span>
                                            ) : col.key === 'name' ? (
                                                <span
                                                    className="fw-bold text-primary text-decoration-underline"
                                                    style={{ cursor: "pointer" }}
                                                    onClick={() => { setItemToView(item); setShowViewModal(true); }}
                                                >
            {String(item[col.key])}
        </span>
                                            ) : typeof item[col.key] === 'boolean' ? (
                                                <span className={`badge ${item[col.key] ? 'bg-success' : 'bg-secondary'}`}>
            {item[col.key] ? 'Yes' : 'No'}
        </span>
                                            ) : (
                                                item[col.key] !== null && item[col.key] !== undefined && item[col.key] !== ""
                                                    ? String(item[col.key])
                                                    : "—"
                                            )}
                                        </td>
                                    ))}

                                    {/* Likes Column */}
                                    <td>
                                        <button
                                            className={`btn btn-sm ${item.currentUserLiked ? 'btn-danger' : 'btn-outline-danger'}`}
                                            onClick={() => handleLikeToggle(item.id)}
                                        >
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

            <AddItemModal
                show={showAddItemModal}
                onClose={() => setShowAddItemModal(false)}
                onSuccess={fetchInventory}
                inventory={inventory}
            />

            <EditItemModal
                show={showEditModal}
                onClose={() => setShowEditModal(false)}
                onSuccess={() => {
                    fetchInventory();
                    setSelectedItems([]);
                }}
                inventory={inventory}
                item={inventory.items.find(i => i.id === selectedItems[0]) || null}
            />
            {inventory && (
                <ViewItemModal
                    show={showViewModal}
                    onClose={() => { setShowViewModal(false); setItemToView(null); }}
                    inventory={inventory}
                    item={itemToView}
                />
            )}
            
            <DiscussionBoard inventoryId={inventory.id} />
        </div>
    );
}
    
        