import React, { useState } from 'react';
import PostCard from './PostCard';

const PostGrid = ({ posts = [], onPostDeleted }) => {
  const [selectedPost, setSelectedPost] = useState(null);

  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <>
      <div className="post-grid">
        {posts.map((post) => {
          const postId = post.post_id || post.id || post._id;
          const imageUrl = post.image_url || post.imageUrl || post.image;
          const likesCount = post.like_count ?? post.likes_count ?? post.likesCount ?? post.likes?.length ?? 0;
          const commentsCount = post.comment_count ?? post.comments_count ?? post.commentsCount ?? post.comments?.length ?? 0;

          return (
            <div
              key={postId}
              className="post-grid-item"
              onClick={() => setSelectedPost(post)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setSelectedPost(post);
                }
              }}
            >
              <img
                src={imageUrl}
                alt={post.caption || 'User post'}
                className="post-grid-image"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="100%" height="100%" fill="%23eeeeee"/><text x="50%" y="50%" font-size="14" fill="%23888888" dominant-baseline="middle" text-anchor="middle">Image Unavailable</text></svg>';
                }}
              />
              <div className="post-grid-overlay">
                <span className="overlay-stat">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                  {likesCount}
                </span>
                <span className="overlay-stat">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                  </svg>
                  {commentsCount}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected post modal */}
      {selectedPost && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedPost(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            style={{ maxWidth: '470px', width: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                style={{
                  color: '#ffffff',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 8px',
                }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <PostCard
              post={selectedPost}
              onPostDeleted={(id) => {
                setSelectedPost(null);
                if (onPostDeleted) onPostDeleted(id);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default PostGrid;
