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
            // Send the user to the SearchResults page with their query
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
            setSearchQuery(""); // Clear the input box
        }
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
            <div className="container">
                {/* 🟢 Clicking the logo takes you back to the Dashboard */}
                <Link className="navbar-brand fw-bold" to="/">
                    <i className="bi bi-box-seam me-2"></i>
                    FixIt Campus
                </Link>

                {isAdmin && (
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <Link className="nav-link text-warning fw-bold" to="/admin">
                                <i className="bi bi-shield-lock-fill me-1"></i> Admin Panel
                            </Link>
                        </li>
                    </ul>
                )}
                {/**/}
                {/* 🟢 The Search Bar */}
                <form className="d-flex ms-auto" onSubmit={handleSearch}>
                    <div className="input-group">
                        <input
                            type="text"
                            className="form-control bg-light border-0"
                            placeholder="Search inventories & items..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button className="btn btn-primary px-3" type="submit">
                            <i className="bi bi-search"></i>
                        </button>
                    </div>
                </form>
            </div>
        </nav>
    );
}