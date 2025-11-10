import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/story.css';

const StoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const response = await fetch(`/api/posts/${id}`);
        const data = await response.json();

        if (response.ok) {
          setStory(data.post);
        } else {
          setError(data.message || 'Story not found');
        }
      } catch (error) {
        setError('Failed to load story');
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [id]);

  if (loading) {
    return (
      <div className="story-page">
        <div className="story-loading">
          <div className="story-spinner"></div>
          <p>Loading story...</p>
        </div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="story-page">
        <div className="story-error">
          <h2>Story not found</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/home')} className="story-back-btn">
            Back to home
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="story-page">
      {/* Header */}
      <header className="story-header">
        <div className="story-header-container">
          <button className="story-back-btn" onClick={() => navigate('/home')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
          </button>
          <div className="story-logo" onClick={() => navigate('/home')}>
            <svg width="28" height="28" viewBox="0 0 64 64">
              <defs>
                <linearGradient id="storyGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="var(--dl-color-primary)" />
                  <stop offset="100%" stopColor="var(--dl-color-primary-strong)" />
                </linearGradient>
              </defs>
              <rect x="2" y="2" width="60" height="60" rx="12" ry="12" fill="url(#storyGrad)" />
              <path fill="#fff" d="M23 16h9c9 0 15 6 15 16s-6 16-15 16h-9V16zm9 26c6.7 0 11-4.7 11-10s-4.3-10-11-10h-5v20h5z" />
            </svg>
            <span>Draftly</span>
          </div>
        </div>
      </header>

      {/* Story Content */}
      <main className="story-main">
        <article className="story-article">
          <h1 className="story-title">{story.title}</h1>
          
          {story.coverImage && (
            <div className="story-cover-image">
              <img src={story.coverImage} alt={story.title} />
            </div>
          )}
          
          <div className="story-meta">
            <div className="story-author">
              <div className="story-author-avatar">
                <img 
                  src={`https://i.pravatar.cc/150?u=${story.author?.username || 'default'}`} 
                  alt={story.author?.username || 'Author'}
                />
              </div>
              <div className="story-author-info">
                <span className="story-author-name">
                  {story.author?.username || 'Anonymous'}
                </span>
                <div className="story-meta-details">
                  <span className="story-date">{formatDate(story.createdAt)}</span>
                  <span className="story-dot">·</span>
                  <span className="story-read-time">
                    {Math.ceil(story.content.split(' ').length / 200)} min read
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="story-content">
            {story.content.split('\n').map((paragraph, index) => (
              paragraph.trim() && <p key={index}>{paragraph}</p>
            ))}
          </div>
        </article>
      </main>
    </div>
  );
};

export default StoryPage;
