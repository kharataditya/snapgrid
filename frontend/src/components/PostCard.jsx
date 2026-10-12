import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { likesApi, commentsApi, postsApi, formatRelativeTime, getDefaultAvatar } from '../api/api';
import CommentSection from './CommentSection';

const PostCard = ({ post, onPostDeleted }) => {
  const { user } = useAuth();
  const currentUserId = user?.id || user?._id || user?.user_id;

  const postId = post?.post_id || post?.id || post?._id;
  const authorId = post?.user_id || post?.userId || post?.user?.id;
  const authorUsername = post?.username || post?.user?.username || 'user';
  const authorAvatar = post?.profile_image_url || post?.user_profile_image || post?.user?.profile_image_url;

  const isOwner = String(authorId) === String(currentUserId) || (user && user.username === authorUsername);

  const [isLiked, setIsLiked] = useState(
    Boolean(post?.is_liked || post?.isLiked || post?.liked_by_me)
  );
  const [likesCount, setLikesCount] = useState(
    Number(post?.like_count ?? post?.likes_count ?? post?.likesCount ?? post?.likes?.length ?? 0)
  );
  const [likedBy, setLikedBy] = useState(post?.liked_by || []);
  const [likeLoading, setLikeLoading] = useState(false);

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post?.comments || []);
  const [commentsCount, setCommentsCount] = useState(
    Number(post?.comment_count ?? post?.comments_count ?? post?.commentsCount ?? post?.comments?.length ?? 0)
  );
  const [loadingComments, setLoadingComments] = useState(false);
  const [quickCommentText, setQuickCommentText] = useState('');
  const [quickSubmitting, setQuickSubmitting] = useState(false);

  // Sync internal state whenever feed re-fetches or parent props update
  React.useEffect(() => {
    setIsLiked(Boolean(post?.is_liked || post?.isLiked || post?.liked_by_me));
    setLikesCount(
      Number(post?.like_count ?? post?.likes_count ?? post?.likesCount ?? post?.likes?.length ?? 0)
    );
    setCommentsCount(
      Number(post?.comment_count ?? post?.comments_count ?? post?.commentsCount ?? post?.comments?.length ?? 0)
    );
    setLikedBy(post?.liked_by || []);
  }, [post?.is_liked, post?.like_count, post?.comment_count, post?.liked_by]);

  const [deleting, setDeleting] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const handleLikeToggle = async () => {
    if (likeLoading) return;
    setLikeLoading(true);

    const prevLiked = isLiked;
    const prevCount = likesCount;
    const prevLikedBy = [...likedBy];
    const myUsername = user?.username;

    // Optimistic update
    const nextLiked = !prevLiked;
    setIsLiked(nextLiked);
    setLikesCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1);

    if (myUsername) {
      if (nextLiked && !prevLikedBy.includes(myUsername)) {
        setLikedBy([myUsername, ...prevLikedBy]);
      } else if (!nextLiked) {
        setLikedBy(prevLikedBy.filter((u) => u !== myUsername));
      }
    }

    try {
      let res;
      if (prevLiked) {
        res = await likesApi.unlikePost(postId);
      } else {
        res = await likesApi.likePost(postId);
      }
      if (res && typeof res.like_count === 'number') {
        setLikesCount(res.like_count);
      }
      if (res && typeof res.is_liked === 'boolean') {
        setIsLiked(res.is_liked);
      }
      if (res && Array.isArray(res.liked_by)) {
        setLikedBy(res.liked_by);
      }
    } catch (err) {
      // Revert on error
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
      setLikedBy(prevLikedBy);
      console.error('Like toggle failed:', err);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleToggleComments = async () => {
    if (!showComments && comments.length === 0) {
      setLoadingComments(true);
      try {
        const data = await commentsApi.getComments(postId);
        const list = Array.isArray(data) ? data : data?.comments || data?.data || [];
        setComments(list);
      } catch (err) {
        console.error('Failed to fetch comments:', err);
      } finally {
        setLoadingComments(false);
      }
    }
    setShowComments((prev) => !prev);
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    setDeleting(true);
    try {
      await postsApi.deletePost(postId);
      if (onPostDeleted) {
        onPostDeleted(postId);
      }
    } catch (err) {
      alert(`Could not delete post: ${err.message}`);
      setDeleting(false);
    }
  };

  const handleCommentAdded = (newComment) => {
    setCommentsCount((prev) => prev + 1);
  };

  const handleCommentDeleted = () => {
    setCommentsCount((prev) => Math.max(0, prev - 1));
  };

  const handleQuickCommentSubmit = async (e) => {
    e.preventDefault();
    const trimmed = quickCommentText.trim();
    if (!trimmed || quickSubmitting) return;

    setQuickSubmitting(true);
    try {
      const res = await commentsApi.addComment(postId, trimmed);
      const newComment = res?.comment || res?.data || {
        comment_id: Date.now(),
        post_id: postId,
        user_id: currentUserId,
        username: user?.username,
        comment_text: trimmed,
        created_at: new Date().toISOString(),
      };
      setComments((prev) => [...prev, newComment]);
      setCommentsCount((prev) => prev + 1);
      setQuickCommentText('');
      setShowComments(true);
    } catch (err) {
      alert(`Could not post comment: ${err.message}`);
    } finally {
      setQuickSubmitting(false);
    }
  };

  const displayAvatar = !avatarError && authorAvatar ? authorAvatar : getDefaultAvatar(authorUsername);

  return (
    <article className="post-card">
      {/* Header */}
      <header className="post-card-header">
        <Link to={`/profile/${authorId || authorUsername}`} className="post-author-info">
          <img
            src={displayAvatar}
            alt={authorUsername}
            className="post-author-avatar"
            onError={() => setAvatarError(true)}
          />
          <span className="post-author-username">{authorUsername}</span>
        </Link>

        {isOwner && (
          <button
            type="button"
            className="post-delete-btn"
            onClick={handleDeletePost}
            disabled={deleting}
            title="Delete post"
            aria-label="Delete post"
          >
            {deleting ? (
              <span style={{ fontSize: '12px' }}>...</span>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            )}
          </button>
        )}
      </header>

      {/* Image */}
      <div className="post-image-container">
        {imgError ? (
          <div style={{ color: '#8e8e8e', textAlign: 'center', padding: '20px' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            <p style={{ marginTop: '8px', fontSize: '13px' }}>Image unavailable</p>
          </div>
        ) : (
          <img
            src={post?.image_url || post?.imageUrl || post?.image}
            alt={post?.caption || 'Post image'}
            className="post-image"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        )}
      </div>

      {/* Post Actions & Details */}
      <div className="post-card-body">
        <div className="post-action-bar">
          {/* Like Button */}
          <button
            type="button"
            className={`action-btn ${isLiked ? 'liked' : ''}`}
            onClick={handleLikeToggle}
            aria-label={isLiked ? 'Unlike post' : 'Like post'}
          >
            {isLiked ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--color-danger)" stroke="var(--color-danger)" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            )}
          </button>

          {/* Comment icon */}
          <button
            type="button"
            className="action-btn"
            onClick={handleToggleComments}
            aria-label="View comments"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
          </button>
        </div>

        {/* Likes Count & Individual Status */}
        <div style={{ marginBottom: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <span className="post-likes-count" style={{ fontWeight: 700, fontSize: '13px' }}>
              {likesCount === 1 ? '1 like' : `${likesCount.toLocaleString()} likes`}
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '12px',
                backgroundColor: isLiked ? 'rgba(239, 68, 68, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                color: isLiked ? '#ef4444' : '#6b7280',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {isLiked ? '❤️ Liked by you' : '🤍 Not liked by you'}
            </span>
          </div>

          {/* Likers detail line */}
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            {likesCount === 0 ? (
              <span>Be the first to like this as @{user?.username}</span>
            ) : isLiked ? (
              <span>
                Liked by <strong>you</strong>
                {likedBy.filter((u) => u !== user?.username).length > 0 && (
                  <> and {likedBy.filter((u) => u !== user?.username).length} other{likedBy.filter((u) => u !== user?.username).length > 1 ? 's' : ''} ({likedBy.filter((u) => u !== user?.username).slice(0, 2).map((u) => `@${u}`).join(', ')}{likedBy.filter((u) => u !== user?.username).length > 2 ? '...' : ''})</>
                )}
              </span>
            ) : (
              <span>
                Liked by {likedBy.slice(0, 2).map((u) => `@${u}`).join(', ')}
                {likedBy.length > 2 && <> and {likedBy.length - 2} others</>}
              </span>
            )}
          </div>
        </div>

        {/* Caption */}
        {post?.caption && (
          <div className="post-caption-box">
            <Link to={`/profile/${authorId || authorUsername}`} className="post-caption-username">
              {authorUsername}
            </Link>
            <span className="post-caption-text">{post.caption}</span>
          </div>
        )}

        {/* Comments Toggle */}
        {commentsCount > 0 && (
          <button
            type="button"
            className="view-comments-btn"
            onClick={handleToggleComments}
          >
            {showComments
              ? 'Hide comments'
              : `View all ${commentsCount} comments`}
          </button>
        )}

        {/* Timestamp */}
        {(post?.created_at || post?.createdAt) && (
          <time className="post-timestamp" dateTime={post?.created_at || post?.createdAt}>
            {formatRelativeTime(post?.created_at || post?.createdAt)}
          </time>
        )}

        {/* Comments Section */}
        {showComments ? (
          loadingComments ? (
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', padding: '8px 0' }}>
              Loading comments...
            </p>
          ) : (
            <CommentSection
              postId={postId}
              initialComments={comments}
              onCommentAdded={handleCommentAdded}
              onCommentDeleted={handleCommentDeleted}
            />
          )
        ) : (
          <form className="comment-form" onSubmit={handleQuickCommentSubmit} style={{ marginTop: '8px' }}>
            <input
              type="text"
              className="comment-input"
              placeholder="Add a comment..."
              value={quickCommentText}
              onChange={(e) => setQuickCommentText(e.target.value)}
              disabled={quickSubmitting}
            />
            <button
              type="submit"
              className="comment-submit-btn"
              disabled={!quickCommentText.trim() || quickSubmitting}
            >
              {quickSubmitting ? '...' : 'Post'}
            </button>
          </form>
        )}
      </div>
    </article>
  );
};

export default PostCard;
