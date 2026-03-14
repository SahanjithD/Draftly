import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/settings.css';

const SettingsPage = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const [formData, setFormData] = useState({
        fullName: '',
        bio: '',
        profilePicture: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchProfile = useCallback(async () => {
        try {
            const response = await fetch('/api/users/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (response.ok) {
                setError('');
                setFormData({
                    fullName: data.user.fullName || '',
                    bio: data.user.bio || '',
                    profilePicture: data.user.profilePicture || ''
                });
            } else {
                setError(data.message || 'Failed to load profile');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [token]);

    // Redirect if not logged in
    useEffect(() => {
        if (!token) {
            navigate('/login');
        } else {
            fetchProfile();
        }
    }, [fetchProfile, token, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Profile updated successfully!');
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(data.message || 'Failed to update profile');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="settings-page">
                <div className="settings-container">
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="settings-page">
            {/* Navigation Bar */}
            <nav className="settings-nav">
                <div className="settings-nav-container">
                    <button className="back-btn" onClick={() => navigate('/profile')}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                        </svg>
                        Back to Profile
                    </button>
                    <h1 className="settings-title">Settings</h1>
                </div>
            </nav>

            {/* Main Content */}
            <div className="settings-container">
                <div className="settings-card">
                    <h2>Edit Profile</h2>

                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}

                    <form onSubmit={handleSubmit} className="settings-form">
                        <div className="form-group">
                            <label htmlFor="fullName">Full Name</label>
                            <input
                                type="text"
                                id="fullName"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                placeholder="Your full name"
                                maxLength="100"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="bio">
                                Bio
                                <span className="char-count">{formData.bio.length}/500</span>
                            </label>
                            <textarea
                                id="bio"
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                placeholder="Tell us about yourself..."
                                maxLength="500"
                                rows="5"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="profilePicture">Profile Picture URL</label>
                            <input
                                type="url"
                                id="profilePicture"
                                value={formData.profilePicture}
                                onChange={(e) => setFormData({ ...formData, profilePicture: e.target.value })}
                                placeholder="https://example.com/image.jpg"
                            />
                            {formData.profilePicture && (
                                <div className="image-preview">
                                    <img
                                        src={formData.profilePicture}
                                        alt="Preview"
                                        onError={(e) => e.target.style.display = 'none'}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={() => navigate('/profile')}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="save-btn"
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
