import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import '../styles/auth.css';

const LoginPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                // Send exactly what backend expects
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password
                })
            });
            // Safely parse JSON; handle non-JSON responses
            const text = await response.text();
            let data = {};
            try { data = text ? JSON.parse(text) : {}; } catch { data = { message: text || 'Invalid server response' }; }
            
            if (response.ok) {
                localStorage.setItem('token', data.token);
                // Navigate to home page on successful login
                navigate('/home');
            } else {
                setError(data.message || `Sign in failed (HTTP ${response.status})`);
            }
        } catch (error) {
            // Network-level error (CORS, server down, DNS, etc.)
            setError(error?.message || 'Network error. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-main">
                <div className="auth-container">
                    <div className="auth-logo" aria-label="Draftly">
                        {/* Draftly monogram: D in a rounded square */}
                        <svg width="82" height="82" viewBox="0 0 64 64" role="img" aria-hidden="true">
                            <defs>
                                <linearGradient id="dlGrad" x1="0" y1="0" x2="1" y2="1">
                                    <stop offset="0%" stopColor="var(--dl-color-primary)" />
                                    <stop offset="100%" stopColor="var(--dl-color-primary-strong)" />
                                </linearGradient>
                            </defs>
                            <rect x="2" y="2" width="60" height="60" rx="12" ry="12" fill="url(#dlGrad)" />
                            <path fill="#fff" d="M23 16h9c9 0 15 6 15 16s-6 16-15 16h-9V16zm9 26c6.7 0 11-4.7 11-10s-4.3-10-11-10h-5v20h5z" />
                        </svg>
                    </div>
                    <h1>Welcome back.</h1>
                    <div className="auth-content">
                        {error && <div className="auth-error">{error}</div>}
                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    name="username"
                                    autoComplete="username"
                                    placeholder="Username"
                                    value={formData.username}
                                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="input-wrapper">
                                <input
                                    type="password"
                                    name="password"
                                    autoComplete="current-password"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    required
                                />
                            </div>
                            <button 
                                type="submit" 
                                className={`auth-button ${isLoading ? 'loading' : ''}`}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </form>
                        <div className="auth-footer">
                            <p>No account? <a href="/register">Create one</a></p>
                            <a href="/forgot-password" className="forgot-password">Forgot password?</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;



