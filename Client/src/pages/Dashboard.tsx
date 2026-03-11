import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateInventoryModal from '../components/CreateInventoryModal';
import EditInventoryModal from '../components/EditInventoryModal';
import { fetchWithAuth } from "../utils/api";
import TagCloud from "../components/TagCloud";

interface Inventory {
    id: number;
    title: string;
    description: string;
    category: string;
    customIdTemplate: string;
    userId: number;
}

export default function Dashboard() {
    const [inventories, setInventories] = useState<Inventory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedInventoryForEdit, setSelectedInventoryForEdit] = useState<Inventory | null>(null);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    
    // 🟢 Table Row Selections
    const [selectedMyIds, setSelectedMyIds] = useState<number[]>([]);
    const [selectedAllIds, setSelectedAllIds] = useState<number[]>([]);
    
    const navigate = useNavigate();
    const userString = localStorage.getItem('user');
    const currentUser = userString ? JSON.parse(userString) : null;
    const currentUserId = Number(currentUser?.id || currentUser?.Id || currentUser?.userId || currentUser?.UserId);

    const fetchInventories = useCallback(() => {
        setIsLoading(true);
        let url = 'https://inventorymanager-c0d3cbfwfxd9dwd8.canadacentral-01.azurewebsites.net/api/inventories';
        if (selectedTag) url += `?tag=${encodeURIComponent(selectedTag)}`;

        fetch(url)
            .then(res => res.json())
            .then(data => {
                setInventories(data);
                setIsLoading(false);
                setSelectedMyIds([]);
                setSelectedAllIds([]);
            })
            .catch(err => {
                console.error(err);
                setIsLoading(false);
            });
    }, [selectedTag]);

    useEffect(() => { fetchInventories(); }, [fetchInventories]);

    // 🟢 Toolbar Handlers
    const handleView = (idList: number[]) => {
        if (idList.length === 1) navigate(`/inventory/${idList[0]}`);
    };

    const handleEdit = (idList: number[]) => {
        if (idList.length === 1) {
            const inv = inventories.find(i => i.id === idList[0]);
            if (inv) {
                setSelectedInventoryForEdit(inv);
                setShowEditModal(true);
            }
        }
    };

    const handleDelete = async (idList: number[]) => {
        if (!window.confirm(`Are you sure you want to delete ${idList.length} inventory/inventories?`)) return;
        try {
            for (const id of idList) {
                await fetchWithAuth(`https://inventorymanager-c0d3cbfwfxd9dwd8.canadacentral-01.azurewebsites.net/api/inventories/${id}`, { method: 'DELETE' });
            }
            fetchInventories();
        } catch (error) {
            console.error("Error deleting:", error);
        }
    };

    const toggleSelection = (id: number, list: number[], setList: React.Dispatch<React.SetStateAction<number[]>>) => {
        setList(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const myInventories = inventories.filter(inv => inv.userId === currentUserId);

    if (isLoading && inventories.length === 0) return <div className="container mt-5 text-center"><div className="spinner-border text-primary"></div></div>;

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Dashboard</h1>
                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>+ New Inventory</button>
            </div>

            {/* --- PERSONAL DASHBOARD SECTION --- */}
            <h3 className="mb-3">My Inventories</h3>
            
            {/* Toolbar for My Inventories */}
            <div className="mb-2 p-2 bg-light border rounded d-flex gap-2">
                <button className="btn btn-sm btn-outline-primary" disabled={selectedMyIds.length !== 1} onClick={() => handleView(selectedMyIds)}>View Items</button>
                <button className="btn btn-sm btn-outline-warning" disabled={selectedMyIds.length !== 1} onClick={() => handleEdit(selectedMyIds)}>Edit Settings</button>
                <button className="btn btn-sm btn-outline-danger" disabled={selectedMyIds.length === 0} onClick={() => handleDelete(selectedMyIds)}>Delete</button>
            </div>

            <div className="table-responsive mb-5">
                <table className="table table-bordered table-striped">
                    <thead className="table-dark">
                        <tr>
                            <th style={{width: '50px'}} className="text-center">☑</th>
                            <th>ID</th>
                            <th>Title</th>
                            <th>Category</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {myInventories.length === 0 ? (
                            <tr><td colSpan={5} className="text-center">You haven't created any inventories yet.</td></tr>
                        ) : (
                            myInventories.map((inv) => (
                                <tr key={`my-${inv.id}`}>
                                    <td className="text-center">
                                        <input type="checkbox" checked={selectedMyIds.includes(inv.id)} onChange={() => toggleSelection(inv.id, selectedMyIds, setSelectedMyIds)} />
                                    </td>
                                    <td>{inv.id}</td>
                                    <td className="fw-bold">{inv.title}</td>
                                    <td><span className="badge bg-secondary">{inv.category}</span></td>
                                    <td>{inv.description}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <hr className="my-5" />

            {/* --- MAIN PAGE SECTION --- */}
            <h3 className="mb-3">All Inventories</h3>
            <div className="mb-4"><TagCloud selectedTag={selectedTag} onSelectTag={setSelectedTag} /></div>

            {/* Toolbar for All Inventories */}
            <div className="mb-2 p-2 bg-light border rounded d-flex gap-2">
                <button className="btn btn-sm btn-outline-primary" disabled={selectedAllIds.length !== 1} onClick={() => handleView(selectedAllIds)}>View Items</button>
                {/* Only Admins should see Edit/Delete on global items they don't own */}
                {currentUser?.role === 'Admin' && (
                    <>
                        <button className="btn btn-sm btn-outline-warning" disabled={selectedAllIds.length !== 1} onClick={() => handleEdit(selectedAllIds)}>Edit (Admin)</button>
                        <button className="btn btn-sm btn-outline-danger" disabled={selectedAllIds.length === 0} onClick={() => handleDelete(selectedAllIds)}>Delete (Admin)</button>
                    </>
                )}
            </div>

            <div className="table-responsive">
                <table className="table table-bordered table-hover">
                    <thead className="table-light">
                        <tr>
                            <th style={{width: '50px'}} className="text-center">☑</th>
                            <th>ID</th>
                            <th>Title</th>
                            <th>Category</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inventories.length === 0 ? (
                            <tr><td colSpan={5} className="text-center text-muted">No inventories found.</td></tr>
                        ) : (
                            inventories.map((inv) => (
                                <tr key={`all-${inv.id}`}>
                                    <td className="text-center">
                                        <input type="checkbox" checked={selectedAllIds.includes(inv.id)} onChange={() => toggleSelection(inv.id, selectedAllIds, setSelectedAllIds)} />
                                    </td>
                                    <td>{inv.id}</td>
                                    <td className="fw-bold">{inv.title}</td>
                                    <td><span className="badge bg-secondary">{inv.category}</span></td>
                                    <td>{inv.description}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <CreateInventoryModal show={showCreateModal} onClose={() => setShowCreateModal(false)} onSuccess={() => { fetchInventories(); setShowCreateModal(false); }} />
            {selectedInventoryForEdit && <EditInventoryModal show={showEditModal} onClose={() => setShowEditModal(false)} onSuccess={() => { fetchInventories(); setShowEditModal(false); }} inventory={selectedInventoryForEdit} />}
        </div>
    );
}