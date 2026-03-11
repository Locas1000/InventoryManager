import { useEffect, useState, useCallback } from "react";
import { fetchWithAuth } from "../utils/api";
import { Link, useNavigate } from "react-router-dom";

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

export default function AdminDashboard() {
    const [data, setData] = useState<AdminData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const navigate = useNavigate();

    const userString = localStorage.getItem('user');
    const currentUser = userString ? JSON.parse(userString) : null;
    const currentUserId = Number(currentUser?.id || currentUser?.Id || currentUser?.userId || currentUser?.UserId);

    const loadData = useCallback(() => {
        fetchWithAuth("https://inventorymanager-c0d3cbfwfxd9dwd8.canadacentral-01.azurewebsites.net/api/admin/dashboard")
            .then(async (res) => {
                if (res.status === 403) throw new Error("Access Denied: You do not have admin privileges.");
                if (!res.ok) throw new Error("Failed to load admin data.");
                return res.json();
            })
            .then((data) => {
                setData(data);
                setIsLoading(false);
                setSelectedUsers([]); // Clear selection on reload
            })
            .catch((err) => {
                setError(err.message);
                setIsLoading(false);
            });
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleCheckboxChange = (id: number) => {
        setSelectedUsers(prev => 
            prev.includes(id) ? prev.filter(userId => userId !== id) : [...prev, id]
        );
    };

    const handleBulkRoleToggle = async () => {
        if (selectedUsers.length !== 1) {
            alert("Please select exactly one user to toggle their role.");
            return;
        }
        const targetId = selectedUsers[0];
        const targetUser = data?.users.find(u => u.id === targetId);
        if (!targetUser) return;

        const newRole = targetUser.role === "Admin" ? "User" : "Admin";

        if (targetId === currentUserId && newRole === "User") {
            if (!window.confirm("WARNING: You are about to revoke your own Admin privileges. Are you sure?")) return;
        } else if (newRole === "Admin") {
            if (!window.confirm("Promote this user to Admin?")) return;
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
                alert("Failed to update role.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleBulkToggleBlock = async () => {
        if (selectedUsers.includes(currentUserId)) {
            alert("You cannot block yourself. Please unselect your account.");
            return;
        }

        try {
            // Processing sequentially to match the single-endpoint API
            for (const targetId of selectedUsers) {
                await fetchWithAuth(`https://inventorymanager-c0d3cbfwfxd9dwd8.canadacentral-01.azurewebsites.net/api/admin/users/${targetId}/toggle-block`, { method: "PUT" });
            }
            loadData();
        } catch (err) {
            console.error(err);
            alert("An error occurred while toggling block status.");
        }
    };

    const handleBulkDelete = async () => {
        if (selectedUsers.includes(currentUserId)) {
            alert("You cannot delete your own account from the dashboard.");
            return;
        }

        if (!window.confirm(`Are you sure you want to delete ${selectedUsers.length} user(s)?`)) return;

        try {
            for (const targetId of selectedUsers) {
                await fetchWithAuth(`https://inventorymanager-c0d3cbfwfxd9dwd8.canadacentral-01.azurewebsites.net/api/admin/users/${targetId}`, { method: "DELETE" });
            }
            loadData();
        } catch (err) {
            console.error(err);
            alert("An error occurred while deleting users.");
        }
    };

    if (isLoading) return <div className="container mt-5 text-center"><div className="spinner-border text-primary" role="status"></div></div>;
    if (error) return <div className="container mt-5"><div className="alert alert-danger text-center"><p className="lead">{error}</p><Link to="/" className="btn btn-outline-danger mt-3">Return to Dashboard</Link></div></div>;

    return (
        <div className="container mt-5">
            <h2 className="fw-bold mb-4">Admin Control Panel</h2>
            
            {/* 🟢 THE TOOLBAR (Replaces inline buttons) */}
            <div className="mb-3 d-flex gap-2 p-2 bg-light border rounded">
                <button className="btn btn-primary" disabled={selectedUsers.length !== 1} onClick={handleBulkRoleToggle}>
                    Toggle Role (Single)
                </button>
                <button className="btn btn-warning" disabled={selectedUsers.length === 0} onClick={handleBulkToggleBlock}>
                    Toggle Block
                </button>
                <button className="btn btn-danger" disabled={selectedUsers.length === 0} onClick={handleBulkDelete}>
                    Delete Selected
                </button>
                <span className="ms-auto align-self-center text-muted">
                    {selectedUsers.length} selected
                </span>
            </div>

            <div className="card shadow-sm border-0 mb-5">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-bordered table-striped mb-0">
                            <thead className="table-dark">
                                <tr>
                                    <th style={{width: '50px'}} className="text-center">☑</th>
                                    <th>ID</th>
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.users.map((user) => (
                                    <tr key={user.id}>
                                        <td className="text-center">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedUsers.includes(user.id)}
                                                onChange={() => handleCheckboxChange(user.id)}
                                            />
                                        </td>
                                        <td>{user.id}</td>
                                        <td>@{user.username} {user.id === currentUserId && <span className="badge bg-primary ms-2">You</span>}</td>
                                        <td>{user.email}</td>
                                        <td>{user.role}</td>
                                        <td>{user.isBlocked ? <span className="text-danger fw-bold">Blocked</span> : <span className="text-success">Active</span>}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}