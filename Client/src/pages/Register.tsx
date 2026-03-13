// src/pages/Register.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from 'react-i18next'; // 🟢 NEW

export default function Register() {
    const { t } = useTranslation(); // 🟢 NEW
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError(t('err_passwords_match')); // 🟢 TRANSLATED
            return;
        }

        setIsLoading(true);

        try {
            // We use standard fetch here because we don't have a token yet!
            const response = await fetch('https://inventorymanager-c0d3cbfwfxd9dwd8.canadacentral-01.azurewebsites.net/api/Auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || t('err_register_failed')); // 🟢 TRANSLATED Fallback
            }

            // Success! Send them to the login page
            alert(t('msg_register_success')); // 🟢 TRANSLATED
            navigate('/login');

        } catch (err: any) {
            setError(err.message); // Backend errors will display here (we could also translate specific backend strings if needed later)
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-4">
                    <div className="card shadow-sm border-0">
                        <div className="card-body p-4">
                            <h2 className="text-center mb-4 fw-bold">{t('register_header')}</h2>

                            {error && <div className="alert alert-danger">{error}</div>}

                            <form onSubmit={handleRegister}>
                                <div className="mb-3">
                                    <label className="form-label text-muted">{t('username_label')}</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-lg"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        minLength={3}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label text-muted">{t('email_address_label')}</label>
                                    <input
                                        type="email"
                                        className="form-control form-control-lg"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label text-muted">{t('password_label')}</label>
                                    <input
                                        type="password"
                                        className="form-control form-control-lg"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label text-muted">{t('reenter_password_label')}</label>
                                    <input
                                        type="password"
                                        className="form-control form-control-lg"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-success btn-lg w-100 mb-3"
                                    disabled={isLoading}
                                >
                                    {isLoading ? t('btn_creating_account') : t('btn_sign_up')}
                                </button>

                                <div className="text-center text-muted">
                                    {t('already_have_account')} <Link to="/login" className="text-decoration-none">{t('sign_in_link')}</Link>
                                </div>
                            </form>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}