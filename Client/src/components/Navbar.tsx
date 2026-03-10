import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();
    
    const userString = localStorage.getItem('user');
    const currentUser = userString ? JSON.parse(userString) : null;
    const isAdmin = currentUser?.role === "Admin" || currentUser?.Role === "Admin";

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
            setSearchQuery("");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token'); // Added this just in case you are storing a JWT!
        navigate('/login');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
            <div className="container">
                <Link className="navbar-brand fw-bold" to="/">
                    <i className="bi bi-box-seam me-2"></i>
                    FixIt Campus
                </Link>

                {/* Left Side Links */}
                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                    {isAdmin && (
                        <li className="nav-item">
                            <Link className="nav-link text-warning fw-bold" to="/admin">
                                <i className="bi bi-shield-lock-fill me-1"></i> Admin Panel
                            </Link>
                        </li>
                    )}
                </ul>

                <div className="d-flex align-items-center ms-auto">
                    
                    {/* The Search Bar */}
                    <form className="d-flex me-3" onSubmit={handleSearch}>
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control bg-light border-0"
                                placeholder="Search inventories..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button className="btn btn-primary px-3" type="submit">
                                <i className="bi bi-search"></i>
                            </button>
                        </div>
                    </form>

                    {/* 🟢 NEW: Auth Conditional Rendering */}
                    {currentUser ? (
                        <div className="d-flex align-items-center">
                            {/* Optional: Show their name if you want! */}
                            <span className="text-light me-3 d-none d-md-block">
                                <i className="bi bi-person-circle me-1"></i>
                                {currentUser.name || currentUser.Name || 'User'}
                            </span>
                            <button 
                                className="btn btn-outline-danger btn-sm fw-bold" 
                                onClick={handleLogout}
                            >
                                <i className="bi bi-box-arrow-right me-1"></i> Logout
                            </button>
                        </div>
                    ) : (
                        <Link className="btn btn-success btn-sm fw-bold" to="/login">
                            <i className="bi bi-box-arrow-in-right me-1"></i> Login / Register
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}