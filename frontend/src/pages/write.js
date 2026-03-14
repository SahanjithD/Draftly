import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/write.css';

const WritePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const token = localStorage.getItem('token');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    coverImage: ''
  });
  const [isPublishing, setIsPublishing] = useState(false);
  const [isLoadingPost, setIsLoadingPost] = useState(isEditMode);
  const [error, setError] = useState('');

  // Redirect if not logged in
  React.useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  React.useEffect(() => {
    const fetchPostForEdit = async () => {
      if (!isEditMode) {
        setIsLoadingPost(false);
        return;
      }

      try {
        const response = await fetch(`/api/posts/${id}`);
        const text = await response.text();
        let data = {};
        try {
          data = text ? JSON.parse(text) : {};
        } catch {
          data = { message: text || 'Invalid server response' };
        }

        if (!response.ok) {
          setError(data.message || 'Failed to load story for editing');
          return;
        }

        setFormData({
          title: data.post?.title || '',
          content: data.post?.content || '',
          coverImage: data.post?.coverImage || ''
        });
      } catch (fetchError) {
        setError(fetchError?.message || 'Network error. Please check your connection.');
      } finally {
        setIsLoadingPost(false);
      }
    };

    fetchPostForEdit();
  }, [id, isEditMode]);

  const handlePublish = async (e) => {
    e.preventDefault();
    setIsPublishing(true);
    setError('');

    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Please add both a title and content');
      setIsPublishing(false);
      return;
    }

    try {
      const endpoint = isEditMode ? `/api/posts/${id}` : '/api/posts';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          coverImage: formData.coverImage
        })
      });

      const text = await response.text();
      let data = {};
      try { 
        data = text ? JSON.parse(text) : {}; 
      } catch { 
        data = { message: text || 'Invalid server response' }; 
      }

      if (response.ok) {
        const postId = data.post?._id;
        navigate(postId ? `/story/${postId}` : '/profile');
      } else {
        const actionLabel = isEditMode ? 'Update' : 'Publish';
        setError(data.message || `${actionLabel} failed (HTTP ${response.status})`);
      }
    } catch (error) {
      setError(error?.message || 'Network error. Please check your connection.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCancel = () => {
    if (formData.title || formData.content) {
      if (window.confirm('Discard draft?')) {
        navigate('/profile');
      }
    } else {
      navigate('/profile');
    }
  };

  if (isLoadingPost) {
    return (
      <div className="write-page">
        <main className="write-main">
          <div className="write-container">
            <p>Loading story...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="write-page">
      {/* Header */}
      <header className="write-header">
        <div className="write-header-container">
          <button className="write-back-btn" onClick={handleCancel}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
          </button>
          <div className="write-header-actions">
            <button 
              className="write-publish-btn" 
              onClick={handlePublish}
              disabled={isPublishing}
            >
              {isPublishing ? (isEditMode ? 'Saving...' : 'Publishing...') : (isEditMode ? 'Save Changes' : 'Publish')}
            </button>
          </div>
        </div>
      </header>

      {/* Editor */}
      <main className="write-main">
        <div className="write-container">
          {error && <div className="write-error">{error}</div>}
          
          <form onSubmit={handlePublish} className="write-form">
            <input
              type="text"
              className="write-title"
              placeholder={isEditMode ? 'Edit title' : 'Title'}
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              autoFocus
            />
            <input
              type="text"
              className="write-image-url"
              placeholder="Cover image URL (optional)"
              value={formData.coverImage}
              onChange={(e) => setFormData({...formData, coverImage: e.target.value})}
            />
            {formData.coverImage && (
              <div className="write-image-preview">
                <img src={formData.coverImage} alt="Cover preview" onError={(e) => e.target.style.display = 'none'} />
              </div>
            )}
            <textarea
              className="write-content"
              placeholder="Tell your story..."
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
            />
          </form>
        </div>
      </main>
    </div>
  );
};

export default WritePage;
