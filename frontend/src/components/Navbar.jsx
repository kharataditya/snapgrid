import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDefaultAvatar } from '../api/api';
import CreatePostModal from './CreatePostModal';

const Navbar = ({ onPostCreated }) => {
  const { user, logout, switchUser } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [switchSuccess, setSwitchSuccess] = useState(null);

  const currentUserId = user?.user_id || user?.id || user?._id || user?.username;
  const avatarSrc = !avatarError && user?.profile_image_url
    ? user.profile_image_url
    : getDefaultAvatar(user?.username);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSwitch = async (email) => {
    if (switching) return;
    setSwitching(true);
    try {
      const switchedUser = await switchUser(email, 'password123');
      setSwitchSuccess(`Switched to @${switchedUser?.username}!`);
      setTimeout(() => setSwitchSuccess(null), 3000);
      navigate('/');
    } catch (err) {
      alert(`Could not switch account: ${err.message}`);
    } finally {
      setSwitching(false);
    }
  };

  const handleNewPost = (post) => {
    if (onPostCreated) {
      onPostCreated(post);
    }
  };

  const isJohn = user?.username === 'john_doe';
  const isJane = user?.username === 'jane_smith';

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="navbar-brand">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2" />
              <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
              <circle cx="18" cy="6" r="1.5" fill="currentColor" />
            </svg>
            <span className="navbar-brand-gradient">SnapGrid</span>
          </Link>

          {/* Quick Demo Account Switcher Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {switchSuccess && (
              <span style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                padding: '3px 8px',
                borderRadius: '12px'
              }}>
                ✓ {switchSuccess}
              </span>
            )}
            
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={switching}
              style={{
                fontSize: '12px',
                padding: '4px 10px',
                borderRadius: '8px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: 'var(--color-bg)',
                border: '1px solid var(--color-primary)',
                color: 'var(--color-primary)',
                cursor: 'pointer'
              }}
              title={isJohn ? 'Switch to Jane to test opposite likes/follows' : 'Switch to John to test opposite likes/follows'}
              onClick={() => handleSwitch(isJohn ? 'jane@example.com' : 'john@example.com')}
            >
              <span>⚡</span>
              <span>{isJohn ? 'Switch to @jane_smith' : 'Switch to @john_doe'}</span>
            </button>
          </div>

          <div className="navbar-actions">
            {/* Feed / Home */}
            <NavLink
              to="/"
              end
              className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
              title="Home Feed"
              aria-label="Home Feed"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
            </NavLink>

            {/* Explore */}
            <NavLink
              to="/explore"
              className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
              title="Explore / Search"
              aria-label="Explore"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </NavLink>

            {/* Create Post */}
            <button
              type="button"
              className="nav-link-btn"
              onClick={() => setIsModalOpen(true)}
              title="Create Post"
              aria-label="Create Post"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
            </button>

            {/* Profile */}
            <NavLink
              to={`/profile/${currentUserId}`}
              className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
              title={`Logged in as @${user?.username || 'user'}`}
              aria-label="Profile"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
            >
              <img
                src={avatarSrc}
                alt={user?.username || 'Profile'}
                className="nav-user-avatar"
                onError={() => setAvatarError(true)}
              />
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                @{user?.username}
              </span>
            </NavLink>

            {/* Logout */}
            <button
              type="button"
              className="nav-link-btn"
              onClick={handleLogout}
              title="Logout"
              aria-label="Logout"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </div>
        </div>
      </nav>

      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPostCreated={handleNewPost}
      />
    </>
  );
};

export default Navbar;
