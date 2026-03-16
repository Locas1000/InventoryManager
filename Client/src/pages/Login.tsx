// src/pages/Login.tsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import GitHubLogin from 'react-github-login';
import { GoogleLogin } from '@react-oauth/google';
import { useTranslation } from 'react-i18next';

export default function Login() {
    const { t } = useTranslation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const processLoginResponse = (data: any) => {
        if (data.isBlocked) {
            setError(t('err_user_blocked'));
            setIsLoading(false);
            return;
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({ 
            id: data.userId, 
            username: data.username, 
            role: data.role,
            isBlocked: data.isBlocked 
        }));
        navigate('/');
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const response = await fetch('https://inventorymanager-c0d3cbfwfxd9dwd8.canadacentral-01.azurewebsites.net/api/Auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || t('Login failed'));
            }
            if (response.status === 403) {
                throw new Error(t('err_user_blocked'));
            }
            processLoginResponse(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = async (response: any) => {
        if (!response.credential) return;
        setError(null);

        try {
            const res = await fetch('https://inventorymanager-c0d3cbfwfxd9dwd8.canadacentral-01.azurewebsites.net/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: response.credential }),
            });

            const data = await res.json();
            if (res.ok) {
                processLoginResponse(data);
            } else {
                setError(data.message || "Google login failed");
            }
        } catch (err) {
            console.error('Network error during Google login', err);
        }
    };

    const handleGithubSuccess = async (response: { code: string }) => {
        setError(null);
        try {
            const res = await fetch('https://inventorymanager-c0d3cbfwfxd9dwd8.canadacentral-01.azurewebsites.net/api/auth/github', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: response.code }),
            });

            const data = await res.json();
            if (res.ok) {
                processLoginResponse(data);
            } else {
                setError(data.message || "GitHub login failed");
            }
        } catch (err) {
            console.error('Network error during GitHub login', err);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow p-4">
                        <h2 className="text-center">{t('login_header')}</h2>
                        <hr />

                        <form onSubmit={handleLogin}>
                            {error && <div className="alert alert-danger">{error}</div>}
                            <div className="mb-3">
                                <label className="form-label">{t('email_label')}</label>
                                <input 
                                    type="email" 
                                    className="form-control" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    required 
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">{t('password_label')}</label>
                                <input 
                                    type="password" 
                                    className="form-control" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    required 
                                />
                            </div>
                            <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
                                {isLoading ? t('btn_logging_in') : t('btn_login')}
                            </button>
                        </form>

                        <div className="text-center my-3 text-muted">{t('or_divider')}</div>

                        <div className="d-flex flex-column align-items-center gap-3">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => setError('Google Login Failed')}
                            />

                            <GitHubLogin
                                clientId={import.meta.env.VITE_GITHUB_CLIENT_ID || ''}
                                onSuccess={handleGithubSuccess}
                                onFailure={(res) => setError('GitHub Login Failed')}
                                className="btn btn-dark w-100"
                                buttonText={t('btn_github_login')}
                                redirectUri="https://orange-smoke-0ae62950f.6.azurestaticapps.net/login" 
                            />
                        </div>
                        
                        <p className="mt-3 text-center">
                            {t('no_account')} <Link to="/register">{t('register_here')}</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}