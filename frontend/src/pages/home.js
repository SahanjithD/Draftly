import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/home.css';

const HomePage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [dropdownOpen, setDropdownOpen] = useState(false);
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

  // Sample featured posts (replace with real API data later)
  const featuredPosts = [
    {
      id: 1,
      title: "Getting Started with Modern Web Development",
      excerpt: "Learn the fundamentals of building scalable web applications with React, Node.js, and MongoDB.",
      author: "Jane Cooper",
      date: "Nov 8, 2025",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=400&fit=crop"
    },
    {
      id: 2,
      title: "The Art of Clean Code",
      excerpt: "Discover principles and practices that will help you write maintainable, readable code that stands the test of time.",
      author: "Alex Morgan",
      date: "Nov 7, 2025",
      readTime: "8 min read",
      image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&h=400&fit=crop"
    },
    {
      id: 3,
      title: "Mastering Docker and Containerization",
      excerpt: "A comprehensive guide to containerizing your applications and orchestrating them in production environments.",
      author: "Sam Rivera",
      date: "Nov 6, 2025",
      readTime: "12 min read",
      image: "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800&h=400&fit=crop"
    },
    {
      id: 4,
      title: "Building RESTful APIs with Express",
      excerpt: "Step-by-step tutorial on creating robust and scalable REST APIs using Node.js and Express framework.",
      author: "Jordan Lee",
      date: "Nov 5, 2025",
      readTime: "10 min read",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop"
    },
    {
      id: 5,
      title: "React Hooks: A Deep Dive",
      excerpt: "Explore the power of React Hooks and learn how to build more efficient and elegant components.",
      author: "Chris Taylor",
      date: "Nov 4, 2025",
      readTime: "7 min read",
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop"
    },
    {
      id: 6,
      title: "Database Design Best Practices",
      excerpt: "Learn how to design efficient database schemas and optimize queries for better performance.",
      author: "Morgan Blake",
      date: "Nov 3, 2025",
      readTime: "9 min read",
      image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&h=400&fit=crop"
    }
  ];

  return (
    <div className="home-page">
      {/* Navigation Bar */}
      <nav className="home-nav">
        <div className="home-nav-container">
          <div className="home-nav-logo">
            <svg width="32" height="32" viewBox="0 0 64 64">
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
                <button className="home-nav-btn home-nav-btn-write">Write</button>
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
                      <button className="home-dropdown-item" onClick={() => {setDropdownOpen(false); navigate('/profile');}}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8 8c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm0 1c-2 0-6 1-6 3v1h12v-1c0-2-4-3-6-3z"/>
                        </svg>
                        Profile
                      </button>
                      <button className="home-dropdown-item" onClick={() => {setDropdownOpen(false); navigate('/settings');}}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8 10.5c1.38 0 2.5-1.12 2.5-2.5S9.38 5.5 8 5.5 5.5 6.62 5.5 8 6.62 10.5 8 10.5zM14 8c0-.37-.03-.73-.08-1.08l1.46-1.14-1.5-2.6-1.72.69c-.5-.38-1.06-.68-1.66-.88L10 1H6l-.5 1.99c-.6.2-1.16.5-1.66.88l-1.72-.69-1.5 2.6 1.46 1.14C2.03 7.27 2 7.63 2 8s.03.73.08 1.08L.62 10.22l1.5 2.6 1.72-.69c.5.38 1.06.68 1.66.88L6 15h4l.5-1.99c.6-.2 1.16-.5 1.66-.88l1.72.69 1.5-2.6-1.46-1.14c.05-.35.08-.71.08-1.08z"/>
                        </svg>
                        Settings
                      </button>
                      <div className="home-dropdown-divider"></div>
                      <button className="home-dropdown-item" onClick={() => {setDropdownOpen(false); handleLogout();}}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3v2H4v8h2v2zm4-2l4-4-4-4v3H6v2h4v3z"/>
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
        <div className="home-hero-container">
          <h1 className="home-hero-title">Stay curious.</h1>
          <p className="home-hero-subtitle">
            Discover stories, thinking, and expertise from writers on any topic.
          </p>
          <button className="home-hero-cta" onClick={() => navigate('/register')}>
            Start reading
          </button>
        </div>
      </section>

      {/* Featured Posts Grid */}
      <section className="home-posts">
        <div className="home-posts-container">
          <h2 className="home-posts-title">Featured stories</h2>
          <div className="home-posts-grid">
            {featuredPosts.map(post => (
              <article key={post.id} className="home-post-card">
                <div className="home-post-image">
                  <img src={post.image} alt={post.title} />
                </div>
                <div className="home-post-content">
                  <h3 className="home-post-title">{post.title}</h3>
                  <p className="home-post-excerpt">{post.excerpt}</p>
                  <div className="home-post-meta">
                    <span className="home-post-author">{post.author}</span>
                    <span className="home-post-dot">·</span>
                    <span className="home-post-date">{post.date}</span>
                    <span className="home-post-dot">·</span>
                    <span className="home-post-read-time">{post.readTime}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="home-footer-container">
          <p>© 2025 Draftly. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
