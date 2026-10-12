import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { followsApi, getDefaultAvatar } from '../api/api';

const UserCard = ({ user, onFollowChange }) => {
  const { user: currentUser } = useAuth();
  const userId = user?.user_id || user?.id || user?._id;
  const currentUserId = currentUser?.user_id || currentUser?.id || currentUser?._id;
  const isSelf = String(userId) === String(currentUserId);

  const [isFollowing, setIsFollowing] = useState(
    Boolean(user?.is_following || user?.isFollowing)
  );
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setIsFollowing(Boolean(user?.is_following || user?.isFollowing));
  }, [user?.is_following, user?.isFollowing]);

  const handleFollowToggle = async (e) => {
    e.preventDefault();
    if (loading || isSelf) return;

    setLoading(true);
    const nextFollowing = !isFollowing;
    setIsFollowing(nextFollowing); // Optimistic UI

    try {
      if (!nextFollowing) {
        await followsApi.unfollowUser(userId);
      } else {
        await followsApi.followUser(userId);
      }
      if (onFollowChange) onFollowChange(userId, nextFollowing);
      window.dispatchEvent(
        new CustomEvent('snapgrid:follow_change', {
          detail: { userId, isFollowing: nextFollowing }
        })
      );
    } catch (err) {
      setIsFollowing(!nextFollowing); // Revert
      console.error('Follow toggle failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const avatarSrc = !imgError && user?.profile_image_url
    ? user.profile_image_url
    : getDefaultAvatar(user?.username);

  return (
    <div className="user-card">
      <Link to={`/profile/${userId}`} className="user-card-info">
        <img
          src={avatarSrc}
          alt={user?.username || 'User avatar'}
          className="user-card-avatar"
          onError={() => setImgError(true)}
        />
        <div className="user-card-details">
          <span className="user-card-username">{user?.username || 'user'}</span>
          <span className="user-card-fullname">{user?.full_name || user?.name || ''}</span>
        </div>
      </Link>

      {!isSelf && (
        <div className="user-card-action">
          <button
            type="button"
            className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
            style={{ padding: '6px 14px', fontSize: '13px' }}
            onClick={handleFollowToggle}
            disabled={loading}
          >
            {loading ? '...' : isFollowing ? 'Following' : 'Follow'}
          </button>
        </div>
      )}
    </div>
  );
};

export default UserCard;
