import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/profile.css';

const ProfilePage = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deletingPostId, setDeletingPostId] = useState('');

    const fetchUserPosts = useCallback(async (username) => {
        try {
            const response = await fetch(`/api/users/${username}/posts`);
            const data = await response.json();

            if (response.ok) {
                setPosts(data.posts);
            }
        } catch (err) {
            console.error('Error fetching posts:', err);
        } finally {
            setLoading(false);
        }
    }, []);

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
                setProfile(data.user);
                fetchUserPosts(data.user.username);
            } else {
                setError(data.message || 'Failed to load profile');
                setLoading(false);
            }
        } catch (err) {
            setError('Network error. Please try again.');
            setLoading(false);
        }
    }, [fetchUserPosts, token]);

    useEffect(() => {
        if (!token) {
            navigate('/login');
        } else {
            fetchProfile();
        }
    }, [fetchProfile, token, navigate]);

    const handleEditPost = (e, postId) => {
        e.stopPropagation();
        navigate(`/edit/${postId}`);
    };

    const handleDeletePost = async (e, postId) => {
        e.stopPropagation();

        if (!window.confirm('Delete this story? This action cannot be undone.')) {
            return;
        }

        setDeletingPostId(postId);
        try {
            const response = await fetch(`/api/posts/${postId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const text = await response.text();
            let data = {};
            try {
                data = text ? JSON.parse(text) : {};
            } catch {
                data = { message: text || 'Invalid server response' };
            }

            if (!response.ok) {
                setError(data.message || 'Failed to delete story');
                return;
            }

            setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
            setProfile((prevProfile) => {
                if (!prevProfile) return prevProfile;
                return {
                    ...prevProfile,
                    postCount: Math.max((prevProfile.postCount || 1) - 1, 0)
                };
            });
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setDeletingPostId('');
        }
    };

    if (loading) {
        return (
            <div className="profile-page">
                <div className="profile-container">
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-page">
                <div className="profile-container">
                    <div className="error-message">{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            {/* Navigation Bar */}
            <nav className="profile-nav">
                <div className="profile-nav-container">
                    <button className="back-btn" onClick={() => navigate('/home')}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                        </svg>
                        Back to Home
                    </button>
                </div>
            </nav>

            {/* Profile Header */}
            <div className="profile-header">
                <div className="profile-header-container">
                    <div className="profile-avatar">
                        <img
                            src={profile.profilePicture || 'https://i.pravatar.cc/200?img=1'}
                            alt={profile.username}
                            onError={(e) => e.target.src = 'https://i.pravatar.cc/200?img=1'}
                        />
                    </div>
                    <div className="profile-info">
                        <h1 className="profile-username">{profile.username}</h1>
                        {profile.fullName && (
                            <p className="profile-fullname">{profile.fullName}</p>
                        )}
                        {profile.bio && (
                            <p className="profile-bio">{profile.bio}</p>
                        )}
                        <div className="profile-stats">
                            <div className="stat">
                                <strong>{profile.postCount || 0}</strong>
                                <span>Posts</span>
                            </div>
                        </div>
                        <button
                            className="edit-profile-btn"
                            onClick={() => navigate('/settings')}
                        >
                            Edit Profile
                        </button>
                    </div>
                </div>
            </div>

            {/* User's Posts */}
            <div className="profile-posts">
                <div className="profile-posts-container">
                    <h2 className="posts-title">Stories by {profile.username}</h2>

                    {posts.length === 0 ? (
                        <div className="no-posts">
                            <p>No stories yet. Start writing to share your thoughts!</p>
                            <button
                                className="write-btn"
                                onClick={() => navigate('/write')}
                            >
                                Write Your First Story
                            </button>
                        </div>
                    ) : (
                        <div className="posts-grid">
                            {posts.map(post => (
                                <article
                                    key={post._id}
                                    className="post-card"
                                    onClick={() => navigate(`/story/${post._id}`)}
                                >
                                    {post.coverImage && (
                                        <div className="post-image">
                                            <img src={post.coverImage} alt={post.title} />
                                        </div>
                                    )}
                                    <div className="post-content">
                                        <h3 className="post-title">{post.title}</h3>
                                        <p className="post-excerpt">
                                            {post.content.substring(0, 150)}...
                                        </p>
                                        <div className="post-meta">
                                            <span className="post-date">
                                                {new Date(post.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                            <span className="post-dot">·</span>
                                            <span className="post-read-time">
                                                {Math.ceil(post.content.split(' ').length / 200)} min read
                                            </span>
                                        </div>
                                        <div className="post-actions">
                                            <button
                                                type="button"
                                                className="post-action-btn post-action-edit"
                                                onClick={(e) => handleEditPost(e, post._id)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                className="post-action-btn post-action-delete"
                                                onClick={(e) => handleDeletePost(e, post._id)}
                                                disabled={deletingPostId === post._id}
                                            >
                                                {deletingPostId === post._id ? 'Deleting...' : 'Delete'}
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
