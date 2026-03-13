import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // 🟢 NEW
import CreateInventoryModal from '../components/CreateInventoryModal';
import EditInventoryModal from '../components/EditInventoryModal';
import { fetchWithAuth } from "../utils/api";

interface Inventory {
    id: number;
    userId: number;
    title: string;
    description: string;
    category: string;
    allowedUserIds: number[];
}

export default function PersonalPage() {
    const { t } = useTranslation(); // 🟢 NEW
    const [inventories, setInventories] = useState<Inventory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedInventoryForEdit, setSelectedInventoryForEdit] = useState<Inventory | null>(null);
    const [filterText, setFilterText] = useState("");

    const [selectedMyIds, setSelectedMyIds] = useState<number[]>([]);

    const navigate = useNavigate();
    const userString = localStorage.getItem('user');
    const currentUser = userString ? JSON.parse(userString) : null;
    const currentUserId = Number(currentUser?.id || currentUser?.Id || currentUser?.userId || currentUser?.UserId);

    const fetchInventories = useCallback(() => {
        setIsLoading(true);
        fetch('https://inventorymanager-c0d3cbfwfxd9dwd8.canadacentral-01.azurewebsites.net/api/inventories')
            .then(res => res.json())
            .then(data => {
                setInventories(data);
                setIsLoading(false);
                setSelectedMyIds([]);
            })
            .catch(err => { console.error(err); setIsLoading(false); });
    }, []);

    useEffect(() => { fetchInventories(); }, [fetchInventories]);

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
        // 🟢 TRANSLATED (Using interpolation for the count)
        if (!window.confirm(t('confirm_delete_inventories', { count: idList.length }))) return;
        try {
            for (const id of idList) {
                await fetchWithAuth(`https://inventorymanager-c0d3cbfwfxd9dwd8.canadacentral-01.azurewebsites.net/api/inventories/${id}`, { method: 'DELETE' });
            }
            fetchInventories();
        } catch (error) { console.error("Error deleting:", error); }
    };

    const toggleSelection = (id: number) => {
        setSelectedMyIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    // Filter Logic
    const filteredInventories = inventories.filter(inv => inv.title.toLowerCase().includes(filterText.toLowerCase()));

    // Split logic based on ownership vs access
    const myInventories = filteredInventories.filter(inv => inv.userId === currentUserId);
    const writeAccessInventories = filteredInventories.filter(inv => inv.allowedUserIds?.includes(currentUserId));

    if (isLoading && inventories.length === 0) return <div className="container mt-5 text-center"><div className="spinner-border text-primary"></div></div>;

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                {/* 🟢 TRANSLATED */}
                <h1>{t('my_profile')}</h1>
                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>{t('btn_new_inventory')}</button>
            </div>

            <input
                type="text"
                className="form-control mb-4"
                placeholder={t('filter_placeholder')} // 🟢 TRANSLATED
                value={filterText}
                onChange={e => setFilterText(e.target.value)}
            />

            {/* --- TABLE 1: INVENTORIES I OWN --- */}
            <h3 className="mb-3">{t('inventories_i_own')}</h3>
            <div className="mb-2 p-2 bg-light border rounded d-flex gap-2">
                <button className="btn btn-sm btn-outline-warning" disabled={selectedMyIds.length !== 1} onClick={() => handleEdit(selectedMyIds)}>{t('btn_edit_settings')}</button>
                <button className="btn btn-sm btn-outline-danger" disabled={selectedMyIds.length === 0} onClick={() => handleDelete(selectedMyIds)}>{t('btn_delete')}</button>
            </div>

            <div className="table-responsive mb-5">
                <table className="table table-bordered table-striped">
                    <thead className="table-dark">
                    <tr>
                        <th style={{width: '50px'}} className="text-center">☑</th>
                        {/* 🟢 TRANSLATED HEADERS */}
                        <th>{t('table_id')}</th>
                        <th>{t('table_title')}</th>
                        <th>{t('table_category')}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {myInventories.length === 0 ? (
                        <tr><td colSpan={4} className="text-center">{t('no_inventories_found')}</td></tr>
                    ) : (
                        myInventories.map((inv) => (
                            <tr key={`own-${inv.id}`}>
                                <td className="text-center">
                                    <input type="checkbox" checked={selectedMyIds.includes(inv.id)} onChange={() => toggleSelection(inv.id)} />
                                </td>
                                <td>{inv.id}</td>
                                <td className="fw-bold"><span className="text-primary text-decoration-underline" style={{ cursor: "pointer" }} onClick={() => navigate(`/inventory/${inv.id}`)}>{inv.title}</span></td>
                                <td><span className="badge bg-secondary">{inv.category}</span></td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            {/* --- TABLE 2: WRITE ACCESS --- */}
            <h3 className="mb-3">{t('inventories_write_access')}</h3>
            <div className="table-responsive">
                <table className="table table-bordered table-hover">
                    <thead className="table-light">
                    <tr>
                        {/* 🟢 TRANSLATED HEADERS */}
                        <th>{t('table_id')}</th>
                        <th>{t('table_title')}</th>
                        <th>{t('table_category')}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {writeAccessInventories.length === 0 ? (
                        <tr><td colSpan={3} className="text-center text-muted">{t('no_write_access')}</td></tr>
                    ) : (
                        writeAccessInventories.map((inv) => (
                            <tr key={`access-${inv.id}`}>
                                <td>{inv.id}</td>
                                <td className="fw-bold"><span className="text-primary text-decoration-underline" style={{ cursor: "pointer" }} onClick={() => navigate(`/inventory/${inv.id}`)}>{inv.title}</span></td>
                                <td><span className="badge bg-secondary">{inv.category}</span></td>
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