import { useEffect, useState, useCallback } from "react";
import { fetchWithAuth } from "../utils/api";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next"; // 🟢 NEW

interface AdminStats {
    totalUsers: number;
    totalInventories: number;
    totalItems: number;
}

interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    inventoryCount: number;
    isBlocked: boolean;
}

interface AdminData {
    stats: AdminStats;
    users: User[];
}

interface Inventory {
    id: number;
    title: string;
    creatorName: string;
    category: string;
}

export default function AdminDashboard() {
    const { t } = useTranslation(); // 🟢 NEW
    const [data, setData] = useState<AdminData | null>(null);
    const [inventories, setInventories] = useState<Inventory[]>([]); 
    
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [selectedInventories, setSelectedInventories] = useState<number[]>([]); 
    
    const navigate = useNavigate();

    const userString = localStorage.getItem('user');
    const currentUser = userString ? JSON.parse(userString) : null;
    const currentUserId = Number(currentUser?.id || currentUser?.Id || currentUser?.userId || currentUser?.UserId);

    const loadData = useCallback(() => {
        setIsLoading(true);
        
        Promise.all([
            fetchWithAuth("https://inventorymanager-c0d3cbfwfxd9dwd8.canadacentral-01.azurewebsites.net/api/admin/dashboard").then(res => {
                if (res.status === 403) throw new Error("Access Denied: You do not have admin privileges.");
                if (!res.ok) throw new Error("Failed to load admin data.");
                return res.json();
            }),
            fetch("https://inventorymanager-c0d3cbfwfxd9dwd8.canadacentral-01.azurewebsites.net/api/inventories").then(res => res.json())
        ])
        .then(([adminData, inventoryData]) => {
            setData(adminData);
            setInventories(inventoryData);
            setIsLoading(false);
            setSelectedUsers([]);
            setSelectedInventories([]);
        })
        .catch((err) => {
            setError(err.message);
            setIsLoading(false);
        });
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // --- USER HANDLERS ---
    const handleUserCheckboxChange = (id: number) => {
        setSelectedUsers(prev => prev.includes(id) ? prev.filter(userId => userId !== id) : [...prev, id]);
    };

    const handleBulkRoleToggle = async () => {
        if (selectedUsers.length !== 1) {
            alert(t('alert_select_one_user')); // 🟢 TRANSLATED
            return;
        }
        const targetId = selectedUsers[0];
        const targetUser = data?.users.find(u => u.id === targetId);
        if (!targetUser) return;

        const newRole = targetUser.role === "Admin" ? "User" : "Admin";

        if (targetId === currentUserId && newRole === "User") {
            if (!window.confirm(t('alert_revoke_own_admin'))) return; // 🟢 TRANSLATED
        } else if (newRole === "Admin") {
            if (!window.confirm(t('alert_promote_admin'))) return; // 🟢 TRANSLATED
        }

        try {
            const res = await fetchWithAuth(`https://inventorymanager-c0d3cbfwfxd9dwd8.canadacentral-01.azurewebsites.net/api/admin/users/${targetId}/role`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: newRole })
            });

            if (res.ok) {
                if (targetId === currentUserId && newRole === "User") {
                    const updatedUser = { ...currentUser, role: "User", Role: "User" };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    navigate("/");
                    window.location.reload(); 
                } else {
                    loadData(); 
                }
            } else {
                alert(t('alert_fail_update_role')); // 🟢 TRANSLATED
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleBulkToggleBlock = async () => {
        if (selectedUsers.includes(currentUserId)) {
            alert(t('alert_cannot_block_self')); // 🟢 TRANSLATED
            return;
        }

        try {
            for (const targetId of selectedUsers) {
                await fetchWithAuth(`https://inventorymanager-c0d3cbfwfxd9dwd8.canadacentral-01.azurewebsites.net/api/admin/users/${targetId}/toggle-block`, { method: "PUT" });
            }
            loadData();
        } catch (err) {
            console.error(err);
            alert(t('alert_fail_toggle_block')); // 🟢 TRANSLATED
        }
    };

    const handleBulkDeleteUsers = async () => {
        if (selectedUsers.includes(currentUserId)) {
            alert(t('alert_cannot_delete_self')); // 🟢 TRANSLATED
            return;
        }

        if (!window.confirm(t('confirm_delete_users', { count: selectedUsers.length }))) return; // 🟢 TRANSLATED

        try {
            for (const targetId of selectedUsers) {
                await fetchWithAuth(`https://inventorymanager-c0d3cbfwfxd9dwd8.canadacentral-01.azurewebsites.net/api/admin/users/${targetId}`, { method: "DELETE" });
            }
            loadData();
        } catch (err) {
            console.error(err);
            alert(t('alert_fail_delete_users')); // 🟢 TRANSLATED
        }
    };

    // --- INVENTORY HANDLERS ---
    const handleInventoryCheckboxChange = (id: number) => {
        setSelectedInventories(prev => prev.includes(id) ? prev.filter(invId => invId !== id) : [...prev, id]);
    };

    const handleBulkDeleteInventories = async () => {
        if (!window.confirm(t('confirm_delete_global_invs', { count: selectedInventories.length }))) return; // 🟢 TRANSLATED

        try {
            for (const targetId of selectedInventories) {
                await fetchWithAuth(`https://inventorymanager-c0d3cbfwfxd9dwd8.canadacentral-01.azurewebsites.net/api/inventories/${targetId}`, { method: "DELETE" });
            }
            loadData(); // Refreshes both tables and the stats
        } catch (err) {
            console.error(err);
            alert(t('alert_fail_delete_invs')); // 🟢 TRANSLATED
        }
    };


    if (isLoading) return <div className="container mt-5 text-center"><div className="spinner-border text-primary" role="status"></div></div>;
    // 🟢 TRANSLATED Fallback link text
    if (error) return <div className="container mt-5"><div className="alert alert-danger text-center"><p className="lead">{error}</p><Link to="/" className="btn btn-outline-danger mt-3">{t('return_dashboard')}</Link></div></div>;

    return (
        <div className="container mt-5 mb-5">
            <h2 className="fw-bold mb-4">{t('admin_control_panel')}</h2>
            
            {/* ======================= */}
            {/* SECTION 1: MANAGE USERS */}
            {/* ======================= */}
            <h4 className="mb-3 text-secondary border-bottom pb-2">{t('manage_users')}</h4>
            
            <div className="mb-3 d-flex gap-2 p-2 bg-light border rounded">
                <button className="btn btn-primary" disabled={selectedUsers.length !== 1} onClick={handleBulkRoleToggle}>
                    {t('btn_toggle_role')}
                </button>
                <button className="btn btn-warning" disabled={selectedUsers.length === 0} onClick={handleBulkToggleBlock}>
                    {t('btn_toggle_block')}
                </button>
                <button className="btn btn-danger" disabled={selectedUsers.length === 0} onClick={handleBulkDeleteUsers}>
                    {t('btn_delete_selected')}
                </button>
                <span className="ms-auto align-self-center text-muted">
                    {t('count_selected', { count: selectedUsers.length })}
                </span>
            </div>

            <div className="card shadow-sm border-0 mb-5">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-bordered table-striped mb-0 align-middle">
                            <thead className="table-dark">
                                <tr>
                                    <th style={{width: '50px'}} className="text-center">☑</th>
                                    <th>{t('table_id')}</th>
                                    <th>{t('table_username')}</th>
                                    <th>{t('table_email')}</th>
                                    <th>{t('table_role')}</th>
                                    <th>{t('table_status')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.users.map((user) => (
                                    <tr key={`user-${user.id}`}>
                                        <td className="text-center">
                                            <input 
                                                type="checkbox" 
                                                className="form-check-input border-secondary"
                                                checked={selectedUsers.includes(user.id)}
                                                onChange={() => handleUserCheckboxChange(user.id)}
                                            />
                                        </td>
                                        <td>{user.id}</td>
                                        <td>@{user.username} {user.id === currentUserId && <span className="badge bg-primary ms-2">{t('badge_you')}</span>}</td>
                                        <td>{user.email}</td>
                                        {/* Backend literal role value is kept untranslated for consistency, but you can wrap it if you prefer */}
                                        <td>{user.role}</td>
                                        <td>{user.isBlocked ? <span className="text-danger fw-bold">{t('status_blocked')}</span> : <span className="text-success">{t('status_active')}</span>}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ============================= */}
            {/* SECTION 2: MANAGE INVENTORIES */}
            {/* ============================= */}
            <h4 className="mb-3 text-secondary border-bottom pb-2 mt-5">{t('manage_global_inventories')}</h4>

            <div className="mb-3 d-flex gap-2 p-2 bg-light border rounded">
                <button className="btn btn-danger" disabled={selectedInventories.length === 0} onClick={handleBulkDeleteInventories}>
                    {t('btn_delete_selected_invs')}
                </button>
                <span className="ms-auto align-self-center text-muted">
                    {t('count_selected', { count: selectedInventories.length })}
                </span>
            </div>

            <div className="card shadow-sm border-0 mb-5">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-bordered table-striped mb-0 align-middle">
                            <thead className="table-dark">
                                <tr>
                                    <th style={{width: '50px'}} className="text-center">☑</th>
                                    <th>{t('table_id')}</th>
                                    <th>{t('table_title')}</th>
                                    <th>{t('table_creator')}</th>
                                    <th>{t('table_category')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventories.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center text-muted py-4">{t('no_global_inventories')}</td></tr>
                                ) : (
                                    inventories.map((inv) => (
                                        <tr key={`inv-${inv.id}`}>
                                            <td className="text-center">
                                                <input 
                                                    type="checkbox" 
                                                    className="form-check-input border-secondary"
                                                    checked={selectedInventories.includes(inv.id)}
                                                    onChange={() => handleInventoryCheckboxChange(inv.id)}
                                                />
                                            </td>
                                            <td>{inv.id}</td>
                                            <td className="fw-bold">
                                                <Link to={`/inventory/${inv.id}`} className="text-decoration-none">
                                                    {inv.title}
                                                </Link>
                                            </td>
                                            <td>@{inv.creatorName}</td>
                                            <td><span className="badge bg-secondary">{inv.category}</span></td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        </div>
    );
}