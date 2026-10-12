import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { usersApi, getDefaultAvatar } from '../api/api';

const EditProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    profile_image_url: '',
  });

  const [previewError, setPreviewError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || user.name || '',
        bio: user.bio || '',
        profile_image_url: user.profile_image_url || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'profile_image_url') {
      setPreviewError(false);
    }
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    if (!formData.full_name.trim()) {
      setError('Full name cannot be empty.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        full_name: formData.full_name.trim(),
        bio: formData.bio.trim(),
        profile_image_url: formData.profile_image_url.trim(),
      };

      const res = await usersApi.updateProfile(payload);
      const updatedUser = res?.user || res?.data || { ...user, ...payload };

      updateUser(updatedUser);
      setSuccess('Profile updated successfully!');

      setTimeout(() => {
        const userId = user?.user_id || user?.id || user?._id || user?.username;
        navigate(`/profile/${userId}`);
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    const userId = user?.user_id || user?.id || user?._id || user?.username;
    navigate(`/profile/${userId}`);
  };

  const currentAvatar =
    !previewError && formData.profile_image_url
      ? formData.profile_image_url
      : getDefaultAvatar(user?.username);

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="edit-profile-card">
          <h1 className="edit-profile-title">Edit Profile</h1>

          {error && <div className="error-banner">{error}</div>}
          {success && <div className="success-banner">{success}</div>}

          <div className="edit-avatar-preview-wrap">
            <img
              src={currentAvatar}
              alt="Avatar preview"
              className="edit-avatar-img"
              onError={() => setPreviewError(true)}
            />
            <div>
              <div className="edit-avatar-label">{user?.username}</div>
              <div className="edit-avatar-sub">Change profile photo via URL below</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label htmlFor="edit-name" className="form-label">
                Full Name *
              </label>
              <input
                id="edit-name"
                name="full_name"
                type="text"
                className="form-input"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Your full name"
                disabled={saving}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label htmlFor="edit-image-url" className="form-label">
                Profile Image URL
              </label>
              <input
                id="edit-image-url"
                name="profile_image_url"
                type="url"
                className="form-input"
                value={formData.profile_image_url}
                onChange={handleChange}
                placeholder="https://example.com/avatar.jpg"
                disabled={saving}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label htmlFor="edit-bio" className="form-label">
                Bio
              </label>
              <textarea
                id="edit-bio"
                name="bio"
                className="form-input"
                rows="4"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Write something about yourself..."
                disabled={saving}
                maxLength={150}
                style={{ resize: 'vertical' }}
              />
              <div style={{ textAlign: 'right', fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                {formData.bio.length}/150
              </div>
            </div>

            <div className="edit-form-buttons">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditProfile;
