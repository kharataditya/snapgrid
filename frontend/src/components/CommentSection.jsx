import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { commentsApi, formatRelativeTime } from '../api/api';

const CommentSection = ({ postId, initialComments = [], onCommentAdded, onCommentDeleted }) => {
  const { user } = useAuth();
  const currentUserId = user?.id || user?._id || user?.user_id;

  const [comments, setComments] = useState(initialComments);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);

  // Sync with prop if it changes
  React.useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    const trimmed = commentText.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    setError(null);

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

      const updated = [...comments, newComment];
      setComments(updated);
      setCommentText('');
      if (onCommentAdded) onCommentAdded(newComment);
    } catch (err) {
      setError(err.message || 'Failed to post comment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    setDeletingId(commentId);
    setError(null);

    try {
      await commentsApi.deleteComment(commentId);
      const updated = comments.filter((c) => (c.comment_id || c.id || c._id) !== commentId);
      setComments(updated);
      if (onCommentDeleted) onCommentDeleted(commentId);
    } catch (err) {
      setError(err.message || 'Failed to delete comment.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="comment-section">
      {error && <div className="error-banner">{error}</div>}

      <div className="comments-list">
        {comments.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', padding: '6px 0' }}>
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => {
            const commentId = comment.comment_id || comment.id || comment._id;
            const authorId = comment.user_id || comment.userId || comment.user?.id;
            const authorUsername = comment.username || comment.user?.username || 'user';
            const isOwner = String(authorId) === String(currentUserId) || (user && user.username === authorUsername);
            const text = comment.comment_text || comment.text || comment.content || '';
            const createdAt = comment.created_at || comment.createdAt;

            return (
              <div key={commentId} className="comment-item">
                <div className="comment-body">
                  <Link to={`/profile/${authorId || authorUsername}`} className="comment-author">
                    {authorUsername}
                  </Link>
                  <span className="comment-text">{text}</span>
                  {createdAt && (
                    <span className="comment-date">
                      {formatRelativeTime(createdAt)}
                    </span>
                  )}
                </div>

                {isOwner && (
                  <button
                    type="button"
                    className="comment-delete-btn"
                    onClick={() => handleDeleteComment(commentId)}
                    disabled={deletingId === commentId}
                    title="Delete comment"
                    aria-label="Delete comment"
                  >
                    {deletingId === commentId ? '...' : '✕'}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      <form className="comment-form" onSubmit={handleAddComment}>
        <input
          type="text"
          className="comment-input"
          placeholder="Add a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          disabled={submitting}
        />
        <button
          type="submit"
          className="comment-submit-btn"
          disabled={!commentText.trim() || submitting}
        >
          {submitting ? 'Posting...' : 'Post'}
        </button>
      </form>
    </div>
  );
};

export default CommentSection;
