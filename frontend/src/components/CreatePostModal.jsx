import React, { useState, useEffect } from 'react';
import { postsApi } from '../api/api';

const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [previewError, setPreviewError] = useState(false);

  // Reset form when modal closes or opens
  useEffect(() => {
    if (!isOpen) {
      setImageUrl('');
      setCaption('');
      setError(null);
      setPreviewError(false);
      setSubmitting(false);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedUrl = imageUrl.trim();

    if (!trimmedUrl) {
      setError('Image URL is required.');
      return;
    }

    try {
      // Basic URL format validation
      new URL(trimmedUrl);
    } catch {
      setError('Please provide a valid image URL (e.g. starting with http:// or https://)');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const newPost = await postsApi.createPost({
        image_url: trimmedUrl,
        imageUrl: trimmedUrl,
        caption: caption.trim(),
      });

      const createdPostObj = newPost?.post || newPost?.data || newPost;
      if (onPostCreated) {
        onPostCreated(createdPostObj);
      }
      window.dispatchEvent(
        new CustomEvent('snapgrid:post_created', { detail: createdPostObj })
      );
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ width: 24 }}></div>
          <h2 className="modal-title">Create new post</h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="error-banner">{error}</div>}

            <div className="form-group">
              <label htmlFor="post-image-url" className="form-label">
                Image URL *
              </label>
              <input
                id="post-image-url"
                type="url"
                className="form-input"
                placeholder="https://images.unsplash.com/photo-..."
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setPreviewError(false);
                }}
                disabled={submitting}
                required
              />
            </div>

            {/* Preview Box */}
            <div className="modal-preview-box">
              {imageUrl && !previewError ? (
                <img
                  src={imageUrl}
                  alt="Post preview"
                  className="modal-preview-img"
                  onError={() => setPreviewError(true)}
                />
              ) : (
                <div className="modal-preview-placeholder">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                  <span>
                    {previewError
                      ? 'Unable to load preview from this URL. Make sure it points directly to an image.'
                      : 'Image preview will appear here'}
                  </span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="post-caption" className="form-label">
                Caption
              </label>
              <textarea
                id="post-caption"
                className="form-input"
                rows="3"
                placeholder="Write a caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                disabled={submitting}
                maxLength={500}
                style={{ resize: 'vertical' }}
              />
              <div style={{ textAlign: 'right', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                {caption.length}/500
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!imageUrl.trim() || submitting}
            >
              {submitting ? 'Sharing...' : 'Share'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
