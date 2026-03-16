import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Navbar() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isDarkMode, setIsDarkMode] = useState(false);
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    
    const userString = localStorage.getItem('user');
    const currentUser = userString ? JSON.parse(userString) : null;
    const isAdmin = currentUser?.role === "Admin" || currentUser?.Role === "Admin";

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.setAttribute('data-theme', 'dark');
            setIsDarkMode(true);
        }
    }, []);

    const toggleTheme = () => {
        if (isDarkMode) {
            document.body.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            setIsDarkMode(false);
        } else {
            document.body.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            setIsDarkMode(true);
        }
    };

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'es' : 'en';
        i18n.changeLanguage(newLang);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
            setSearchQuery("");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token'); 
        navigate('/login');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
            <div className="container">
                <Link className="navbar-brand fw-bold" to="/">
                    <i className="bi bi-box-seam me-2"></i>
                    {t('Inventory Manager')}
                </Link>

                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                    {isAdmin && (
                        <li className="nav-item">
                            <Link className="nav-link text-warning fw-bold" to="/admin">
                                <i className="bi bi-shield-lock-fill me-1"></i> {t('Admin Panel')}
                            </Link>
                        </li>
                    )}
                </ul>

                <div className="d-flex align-items-center ms-auto">
                    
                    <form className="d-flex me-3" onSubmit={handleSearch}>
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control bg-light border-0"
                                placeholder={t('Search')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button className="btn btn-primary px-3" type="submit">
                                <i className="bi bi-search"></i>
                            </button>
                        </div>
                    </form>

                    <button className="btn btn-outline-light btn-sm me-2 fw-bold" onClick={toggleLanguage} title="Toggle Language">
                        {i18n.language === 'en' ? 'ES' : 'EN'}
                    </button>

                    <button className="btn btn-outline-light btn-sm me-3" onClick={toggleTheme} title="Toggle Dark Mode">
                        {isDarkMode ? <i className="bi bi-sun-fill"></i> : <i className="bi bi-moon-fill"></i>}
                    </button>

                    {currentUser ? (
                        <div className="d-flex align-items-center">
                            {/* Correctly mapped to Username, with a seamless fallback */}
                            <Link to="/profile" className="text-light me-3 text-decoration-none nav-link custom-hover">
                                <i className="bi bi-person-circle me-1"></i>
                                {currentUser.username || currentUser.Username}
                            </Link>

                            <button className="btn btn-outline-danger btn-sm fw-bold" onClick={handleLogout}>
                                <i className="bi bi-box-arrow-right me-1"></i> {t('Logout')}
                            </button>
                        </div>
                    ) : (
                        <Link className="btn btn-success btn-sm fw-bold" to="/login">
                            <i className="bi bi-box-arrow-in-right me-1"></i> {t('Login')}
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}