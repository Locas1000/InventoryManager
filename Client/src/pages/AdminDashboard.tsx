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
}

interface AdminData {
    stats: AdminStats;
    users: User[];
}

export default function AdminDashboard() {
    const [data, setData] = useState<AdminData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // Extract current user to check if they are modifying themselves
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
            })
            .catch((err) => {
                setError(err.message);
                setIsLoading(false);
            });
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleToggleRole = async (targetId: number, currentRole: string) => {
        const newRole = currentRole === "Admin" ? "User" : "Admin";

        // 🟢 CRITICAL FEATURE: The Admin Self-Demotion Check
        if (targetId === currentUserId && newRole === "User") {
            const confirmDemotion = window.confirm(
                "WARNING: You are about to revoke your own Admin privileges. You will lose access to this dashboard immediately. Are you absolutely sure?"
            );
            if (!confirmDemotion) return;
        } else if (newRole === "Admin") {
            if (!window.confirm("Are you sure you want to promote this user to Admin?")) return;
        }

        try {
            const res = await fetchWithAuth(`/api/admin/users/${targetId}/role`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: newRole })
            });

            if (res.ok) {
                // If they successfully demoted themselves, kick them out!
                if (targetId === currentUserId && newRole === "User") {
                    const updatedUser = { ...currentUser, role: "User", Role: "User" };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    navigate("/");
                    window.location.reload(); // Force the navbar to update and hide the Admin link
                } else {
                    loadData(); // Just refresh the table
                }
            } else {
                alert("Failed to update role.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteUser = async (targetId: number) => {
        if (targetId === currentUserId) {
            alert("You cannot delete your own account from the dashboard.");
            return;
        }

        if (!window.confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) return;

        try {
            const res = await fetchWithAuth(`https://inventorymanager-c0d3cbfwfxd9dwd8.canadacentral-01.azurewebsites.net/api/admin/users/${targetId}`, { method: "DELETE" });
            if (res.ok) {
                loadData();
            } else {
                alert("Failed to delete user.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (isLoading) return <div className="container mt-5 text-center"><div className="spinner-border text-primary" role="status"></div></div>;

    if (error) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger shadow-sm border-0 text-center p-5">
                    <i className="bi bi-shield-lock-fill text-danger" style={{ fontSize: "3rem" }}></i>
                    <h2 className="mt-3 fw-bold">Restricted Area</h2>
                    <p className="lead">{error}</p>
                    <Link to="/" className="btn btn-outline-danger mt-3">Return to Dashboard</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <h2 className="fw-bold mb-4">
                <i className="bi bi-speedometer2 text-primary me-2"></i> 
                Admin Control Panel
            </h2>

            <div className="row g-4 mb-5">
                <div className="col-md-4">
                    <div className="card text-center shadow-sm border-0 bg-primary text-white h-100 py-3">
                        <div className="card-body">
                            <h1 className="display-4 fw-bold">{data?.stats.totalUsers}</h1>
                            <h5 className="card-title">Registered Users</h5>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card text-center shadow-sm border-0 bg-success text-white h-100 py-3">
                        <div className="card-body">
                            <h1 className="display-4 fw-bold">{data?.stats.totalInventories}</h1>
                            <h5 className="card-title">Total Inventories</h5>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card text-center shadow-sm border-0 bg-info text-dark h-100 py-3">
                        <div className="card-body">
                            <h1 className="display-4 fw-bold">{data?.stats.totalItems}</h1>
                            <h5 className="card-title">Items Tracked</h5>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card shadow-sm border-0 mb-5">
                <div className="card-header bg-white border-bottom-0 pt-4 pb-2">
                    <h4 className="fw-bold mb-0">System Users</h4>
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th className="px-4">ID</th>
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th className="text-center">Inventories Owned</th>
                                    <th className="px-4 text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.users.map((user) => (
                                    <tr key={user.id}>
                                        <td className="px-4 text-muted">#{user.id}</td>
                                        <td className="fw-semibold">
                                            @{user.username}
                                            {user.id === currentUserId && <span className="badge bg-primary ms-2">You</span>}
                                        </td>
                                        <td>{user.email}</td>
                                        <td>
                                            <span className={`badge ${user.role === 'Admin' ? 'bg-danger' : 'bg-secondary'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="text-center">{user.inventoryCount}</td>
                                        <td className="px-4 text-end">
                                            {/* 🟢 The New Actions Menu */}
                                            <button 
                                                className={`btn btn-sm me-2 ${user.role === 'Admin' ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                                onClick={() => handleToggleRole(user.id, user.role)}
                                                title={user.role === 'Admin' ? "Demote to User" : "Promote to Admin"}
                                            >
                                                <i className={`bi ${user.role === 'Admin' ? 'bi-arrow-down-circle' : 'bi-arrow-up-circle'}`}></i>
                                            </button>
                                            
                                            <button 
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleDeleteUser(user.id)}
                                                disabled={user.id === currentUserId} // Prevent deleting yourself
                                                title="Delete User"
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </td>
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