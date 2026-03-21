import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ShapeGrid from '../components/ShapeGrid/ShapeGrid';
import '../styles/home.css';

const HomePage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Track scroll for navbar effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch posts from API
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/posts?limit=6');
        const data = await response.json();

        const transformedPosts = data.posts.map(post => ({
          id: post._id,
          title: post.title,
          excerpt: post.content.substring(0, 150) + '...',
          author: post.author?.username || 'Anonymous',
          date: new Date(post.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }),
          readTime: `${Math.ceil(post.content.split(' ').length / 200)} min read`,
          image: post.coverImage || `https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=400&fit=crop`
        }));

        setFeaturedPosts(transformedPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setFeaturedPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="home-page">
      {/* Floating Glassmorphism Navbar */}
      <nav className={`home-nav ${scrolled ? 'home-nav--scrolled' : ''}`}>
        <div className="home-nav-container">
          <div className="home-nav-logo" onClick={() => navigate('/')}>
            <svg width="28" height="28" viewBox="0 0 64 64">
              <defs>
                <linearGradient id="homeGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="var(--dl-color-primary)" />
                  <stop offset="100%" stopColor="var(--dl-color-primary-strong)" />
                </linearGradient>
              </defs>
              <rect x="2" y="2" width="60" height="60" rx="12" ry="12" fill="url(#homeGrad)" />
              <path fill="#fff" d="M23 16h9c9 0 15 6 15 16s-6 16-15 16h-9V16zm9 26c6.7 0 11-4.7 11-10s-4.3-10-11-10h-5v20h5z" />
            </svg>
            <span className="home-nav-brand">Draftly</span>
          </div>
          <div className="home-nav-actions">
            {token ? (
              <>
                <button className="home-nav-btn home-nav-btn-write" onClick={() => navigate('/write')}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                  Write
                </button>
                <div className="home-profile-wrapper" ref={dropdownRef}>
                  <button className="home-profile-btn" onClick={toggleDropdown}>
                    <div className="home-profile-avatar">
                      <img
                        src="https://i.pravatar.cc/150?img=12"
                        alt="Profile"
                        className="home-profile-img"
                      />
                    </div>
                  </button>
                  {dropdownOpen && (
                    <div className="home-profile-dropdown">
                      <button className="home-dropdown-item" onClick={() => { setDropdownOpen(false); navigate('/profile'); }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8 8c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm0 1c-2 0-6 1-6 3v1h12v-1c0-2-4-3-6-3z" />
                        </svg>
                        Profile
                      </button>
                      <button className="home-dropdown-item" onClick={() => { setDropdownOpen(false); navigate('/settings'); }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8 10.5c1.38 0 2.5-1.12 2.5-2.5S9.38 5.5 8 5.5 5.5 6.62 5.5 8 6.62 10.5 8 10.5zM14 8c0-.37-.03-.73-.08-1.08l1.46-1.14-1.5-2.6-1.72.69c-.5-.38-1.06-.68-1.66-.88L10 1H6l-.5 1.99c-.6.2-1.16.5-1.66.88l-1.72-.69-1.5 2.6 1.46 1.14C2.03 7.27 2 7.63 2 8s.03.73.08 1.08L.62 10.22l1.5 2.6 1.72-.69c.5.38 1.06.68 1.66.88L6 15h4l.5-1.99c.6-.2 1.16-.5 1.66-.88l1.72.69 1.5-2.6-1.46-1.14c.05-.35.08-.71.08-1.08z" />
                        </svg>
                        Settings
                      </button>
                      <div className="home-dropdown-divider"></div>
                      <button className="home-dropdown-item home-dropdown-item--danger" onClick={() => { setDropdownOpen(false); handleLogout(); }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3v2H4v8h2v2zm4-2l4-4-4-4v3H6v2h4v3z" />
                        </svg>
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button className="home-nav-btn" onClick={() => navigate('/login')}>Sign in</button>
                <button className="home-nav-btn home-nav-btn-primary" onClick={() => navigate('/register')}>Get started</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="home-hero">
        <div className="home-hero-bg">
          <ShapeGrid
            direction="diagonal"
            speed={0.3}
            borderColor="rgba(0, 0, 0, 0.05)"
            squareSize={50}
            hoverFillColor="rgba(26, 127, 219, 0.08)"
            shape="square"
            hoverTrailAmount={6}
          />
        </div>
        <div className="home-hero-container">
          <span className="home-hero-badge">✦ A space for curious minds</span>
          <h1 className="home-hero-title">
            Where ideas <br /><em>come alive.</em>
          </h1>
          <p className="home-hero-subtitle">
            Discover stories, thinking, and expertise from writers on any topic.
          </p>
          <div className="home-hero-actions">
            <button className="home-hero-cta" onClick={() => navigate('/register')}>
              Start reading
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
              </svg>
            </button>
            <button className="home-hero-cta-secondary" onClick={() => navigate('/login')}>
              Start writing
            </button>
          </div>
        </div>
      </section>

      {/* Featured Posts Grid */}
      <section className="home-posts">
        <div className="home-posts-container">
          <div className="home-posts-header">
            <h2 className="home-posts-title">Featured stories</h2>
            <p className="home-posts-subtitle">Curated reads from our community of writers</p>
          </div>
          {loading ? (
            <div className="home-posts-empty">
              <div className="home-loader"></div>
              <p>Loading stories...</p>
            </div>
          ) : featuredPosts.length === 0 ? (
            <div className="home-posts-empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              <p>No stories yet. Be the first to write one!</p>
              {token && (
                <button className="home-hero-cta" onClick={() => navigate('/write')} style={{ marginTop: '16px' }}>
                  Write a story
                </button>
              )}
            </div>
          ) : (
            <div className="home-posts-grid">
              {featuredPosts.map(post => (
                <article
                  key={post.id}
                  className="home-post-card"
                  onClick={() => navigate(`/story/${post.id}`)}
                >
                  <div className="home-post-image">
                    <img src={post.image} alt={post.title} loading="lazy" />
                  </div>
                  <div className="home-post-content">
                    <h3 className="home-post-title">{post.title}</h3>
                    <p className="home-post-excerpt">{post.excerpt}</p>
                    <div className="home-post-meta">
                      <span className="home-post-author">{post.author}</span>
                      <span className="home-post-dot">·</span>
                      <span>{post.date}</span>
                      <span className="home-post-dot">·</span>
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="home-footer-container">
          <div className="home-footer-brand">
            <svg width="22" height="22" viewBox="0 0 64 64">
              <rect x="2" y="2" width="60" height="60" rx="12" ry="12" fill="rgba(0,0,0,0.15)" />
              <path fill="rgba(255,255,255,0.6)" d="M23 16h9c9 0 15 6 15 16s-6 16-15 16h-9V16zm9 26c6.7 0 11-4.7 11-10s-4.3-10-11-10h-5v20h5z" />
            </svg>
            <span>Draftly</span>
          </div>
          <p>© 2025 Draftly. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
