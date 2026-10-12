import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PostGrid from '../components/PostGrid';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { usersApi, postsApi, followsApi, getDefaultAvatar } from '../api/api';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser, switchUser } = useAuth();

  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const currentUserId = currentUser?.id || currentUser?._id || currentUser?.user_id;
  const isOwnProfile =
    String(id) === String(currentUserId) ||
    String(id).toLowerCase() === String(currentUser?.username).toLowerCase();

  const loadProfileData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch user profile
      const userData = await usersApi.getUser(id);
      const userObj = userData?.user || userData?.data || userData;
      setProfileUser(userObj);

      const resolvedUserId = userObj?.id || userObj?._id || userObj?.user_id || id;

      // Follow status & counts
      setIsFollowing(Boolean(userObj?.is_following || userObj?.isFollowing));
      setFollowersCount(
        Number(userObj?.follower_count ?? userObj?.followers_count ?? userObj?.followersCount ?? 0)
      );
      setFollowingCount(
        Number(userObj?.following_count ?? userObj?.followingCount ?? 0)
      );

      // 2. Fetch user's posts
      try {
        const postsData = await postsApi.getUserPosts(resolvedUserId);
        const postsList = Array.isArray(postsData)
          ? postsData
          : postsData?.posts || postsData?.data || [];
        setPosts(postsList);
      } catch (postErr) {
        console.warn('Failed to fetch posts for user:', postErr);
        setPosts([]);
      }
    } catch (err) {
      setError(err.message || 'User not found or failed to load profile.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProfileData();

    // Listen to real-time events from other components
    const handleGlobalPostCreated = (e) => {
      const newPost = e.detail;
      if (isOwnProfile && newPost) {
        setPosts((prev) => [newPost, ...prev]);
      } else {
        loadProfileData();
      }
    };

    window.addEventListener('snapgrid:post_created', handleGlobalPostCreated);

    const handleUserSwitched = () => {
      loadProfileData();
    };
    window.addEventListener('snapgrid:user_switched', handleUserSwitched);

    return () => {
      window.removeEventListener('snapgrid:post_created', handleGlobalPostCreated);
      window.removeEventListener('snapgrid:user_switched', handleUserSwitched);
    };
  }, [loadProfileData, isOwnProfile]);

  const handleFollowToggle = async () => {
    if (followLoading || isOwnProfile || !profileUser) return;

    setFollowLoading(true);
    const targetId = profileUser.user_id || profileUser.id || profileUser._id || id;
    const prevFollowing = isFollowing;
    const prevCount = followersCount;

    // Optimistic update
    setIsFollowing(!prevFollowing);
    setFollowersCount(prevFollowing ? Math.max(0, prevCount - 1) : prevCount + 1);

    try {
      if (prevFollowing) {
        await followsApi.unfollowUser(targetId);
      } else {
        await followsApi.followUser(targetId);
      }
      window.dispatchEvent(
        new CustomEvent('snapgrid:follow_change', {
          detail: { userId: targetId, isFollowing: !prevFollowing }
        })
      );
    } catch (err) {
      // Revert on error
      setIsFollowing(prevFollowing);
      setFollowersCount(prevCount);
      alert(`Could not update follow status: ${err.message}`);
    } finally {
      setFollowLoading(false);
    }
  };

  const handlePostDeleted = (deletedId) => {
    setPosts((prev) => prev.filter((p) => (p.post_id || p.id || p._id) !== deletedId));
  };

  const avatarSrc =
    !avatarError && profileUser?.profile_image_url
      ? profileUser.profile_image_url
      : getDefaultAvatar(profileUser?.username);

  return (
    <>
      <Navbar onPostCreated={loadProfileData} />
      <div className="profile-container">
        {loading ? (
          <div style={{ paddingTop: '60px' }}>
            <LoadingSpinner size="lg" text="Loading profile..." />
          </div>
        ) : error ? (
          <div className="empty-state">
            <h2 className="empty-state-title">Profile Not Found</h2>
            <p className="empty-state-desc">{error}</p>
            <Link to="/" className="btn btn-primary">
              Back to Feed
            </Link>
          </div>
        ) : (
          <>
            {/* Viewer Context Clarification Banner */}
            <div style={{
              background: isOwnProfile ? 'rgba(59, 130, 246, 0.08)' : 'rgba(245, 158, 11, 0.08)',
              border: `1px solid ${isOwnProfile ? 'rgba(59, 130, 246, 0.2)' : 'rgba(245, 158, 11, 0.25)'}`,
              borderRadius: '10px',
              padding: '10px 16px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <span>{isOwnProfile ? '👤' : '👀'}</span>
                <span>
                  {isOwnProfile ? (
                    <>You are viewing your own profile as <strong>@{currentUser?.username}</strong>. Posts below belong to you.</>
                  ) : (
                    <>
                      Viewing <strong>@{profileUser?.username}</strong>'s posts as <strong>@{currentUser?.username}</strong>. Likes & follows you perform are recorded from <strong>@{currentUser?.username}</strong>.
                    </>
                  )}
                </span>
              </div>

              {!isOwnProfile && (profileUser?.username === 'jane_smith' || profileUser?.username === 'john_doe') && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '6px' }}
                  onClick={() => switchUser(profileUser?.username === 'jane_smith' ? 'jane@example.com' : 'john@example.com')}
                >
                  ⚡ Switch to @{profileUser?.username}
                </button>
              )}
            </div>

            {/* Profile Header */}
            <header className="profile-header">
              <div className="profile-avatar-container">
                <img
                  src={avatarSrc}
                  alt={profileUser?.username || 'Profile avatar'}
                  className="profile-avatar"
                  onError={() => setAvatarError(true)}
                />
              </div>

              <div className="profile-info">
                <div className="profile-actions-row">
                  <h1 className="profile-username">{profileUser?.username}</h1>

                  {isOwnProfile ? (
                    <Link to="/edit-profile" className="btn btn-secondary">
                      Edit Profile
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
                      onClick={handleFollowToggle}
                      disabled={followLoading}
                    >
                      {followLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
                    </button>
                  )}
                </div>

                <ul className="profile-stats">
                  <li className="stat-item">
                    <span className="stat-number">{posts.length}</span> posts
                  </li>
                  <li className="stat-item">
                    <span className="stat-number">{followersCount}</span> followers
                  </li>
                  <li className="stat-item">
                    <span className="stat-number">{followingCount}</span> following
                  </li>
                </ul>

                <div className="profile-bio-section">
                  <div className="profile-fullname">
                    {profileUser?.full_name || profileUser?.name || ''}
                  </div>
                  {profileUser?.bio && (
                    <div className="profile-bio-text">{profileUser.bio}</div>
                  )}
                </div>
              </div>
            </header>

            <hr className="profile-divider" />

            <div className="profile-tabs">
              <div className="profile-tab active">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                <span>Posts</span>
              </div>
            </div>

            {/* Posts Grid */}
            {posts.length === 0 ? (
              <div className="empty-state">
                <svg
                  className="empty-state-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <h3 className="empty-state-title">No Posts Yet</h3>
                <p className="empty-state-desc">
                  {isOwnProfile
                    ? 'Share your first photo to see it displayed here.'
                    : `${profileUser?.username || 'This user'} hasn't posted anything yet.`}
                </p>
              </div>
            ) : (
              <PostGrid posts={posts} onPostDeleted={handlePostDeleted} />
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Profile;
