// src/pages/Login.tsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import GitHubLogin from 'react-github-login';
import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    // 🟢 Standard Form Login
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

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Login failed");
            }

            const data = await response.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify({ id: data.userId, username: data.username, role: data.role }));
            navigate('/');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // 🟢 Added back the Google handler!
    const handleGoogleSuccess = async (response: any) => {
        if (!response.credential) return;

        try {
            const res = await fetch('https://inventorymanager-c0d3cbfwfxd9dwd8.canadacentral-01.azurewebsites.net/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: response.credential }),
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify({ id: data.userId, username: data.username, role: data.role }));
                navigate('/');
            } else {
                console.error('Google login failed on backend');
            }
        } catch (err) {
            console.error('Network error during Google login', err);
        }
    };

    // 🟢 GitHub Handler
    const handleGithubSuccess = async (response: { code: string }) => {
        try {
            const res = await fetch('https://inventorymanager-c0d3cbfwfxd9dwd8.canadacentral-01.azurewebsites.net/api/auth/github', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: response.code }),
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify({ id: data.userId, username: data.username, role: data.role }));
                navigate('/');
            } else {
                console.error('GitHub login failed on backend');
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
                    <h2 className="text-center">Login</h2>
                    <hr />

                    {/* 🟢 RESTORED: Your original Email/Password Form */}
                    <form onSubmit={handleLogin}>
                        {error && <div className="alert alert-danger">{error}</div>}
                        <div className="mb-3">
                            <label className="form-label">Email</label>
                            <input 
                                type="email" 
                                className="form-control" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Password</label>
                            <input 
                                type="password" 
                                className="form-control" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                            />
                        </div>
                        <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
                            {isLoading ? "Logging in..." : "Login"}
                        </button>
                    </form>

                    <div className="text-center my-3 text-muted">OR</div>

                    {/* Social Buttons Section */}
                    <div className="d-flex flex-column align-items-center gap-3">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => console.error('Google Login Failed')}
                        />

                        <GitHubLogin
                            clientId={import.meta.env.VITE_GITHUB_CLIENT_ID || ''}
                            onSuccess={handleGithubSuccess}
                            onFailure={(res) => console.error('GitHub Login Failed', res)}
                            className="btn btn-dark w-100"
                            buttonText="Login with GitHub"
                            redirectUri="https://orange-smoke-0ae62950f.6.azurestaticapps.net/login" 
                        />
                    </div>
                    
                    <p className="mt-3 text-center">
                        Don't have an account? <Link to="/register">Register here</Link>
                    </p>
                </div>
            </div>
        </div>
    </div>
    );
}