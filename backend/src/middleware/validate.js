/**
 * Input validation helpers and middleware for API endpoints.
 */

const validateRegister = (req, res, next) => {
  const { username, email, password, full_name } = req.body;

  if (!username || typeof username !== 'string' || !username.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Username is required.'
    });
  }

  if (username.trim().length < 3 || username.trim().length > 30) {
    return res.status(400).json({
      success: false,
      message: 'Username must be between 3 and 30 characters.'
    });
  }

  if (!email || typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Email is required.'
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address.'
    });
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long.'
    });
  }

  if (!full_name || typeof full_name !== 'string' || !full_name.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Full name is required.'
    });
  }

  req.body.username = username.trim().toLowerCase();
  req.body.email = email.trim().toLowerCase();
  req.body.full_name = full_name.trim();

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Email is required.'
    });
  }

  if (!password || typeof password !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Password is required.'
    });
  }

  req.body.email = email.trim().toLowerCase();

  next();
};

const validateUpdateProfile = (req, res, next) => {
  const { full_name, bio, profile_image_url } = req.body;

  if (full_name !== undefined && (typeof full_name !== 'string' || !full_name.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Full name cannot be empty.'
    });
  }

  if (bio !== undefined && typeof bio !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Bio must be a string.'
    });
  }

  if (profile_image_url !== undefined && typeof profile_image_url !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Profile image URL must be a string.'
    });
  }

  next();
};

const validateCreatePost = (req, res, next) => {
  const { image_url, caption } = req.body;

  if (!image_url || typeof image_url !== 'string' || !image_url.trim()) {
    return res.status(400).json({
      success: false,
      message: 'image_url is required.'
    });
  }

  if (caption !== undefined && typeof caption !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Caption must be a string.'
    });
  }

  req.body.image_url = image_url.trim();
  if (caption) {
    req.body.caption = caption.trim();
  }

  next();
};

const validateCreateComment = (req, res, next) => {
  const { comment_text } = req.body;

  if (!comment_text || typeof comment_text !== 'string' || !comment_text.trim()) {
    return res.status(400).json({
      success: false,
      message: 'comment_text is required and cannot be empty.'
    });
  }

  req.body.comment_text = comment_text.trim();
  next();
};

const validateIdParam = (paramName = 'id') => (req, res, next) => {
  const idValue = req.params[paramName];
  const parsedId = parseInt(idValue, 10);

  if (isNaN(parsedId) || parsedId <= 0) {
    return res.status(400).json({
      success: false,
      message: `Invalid ${paramName} parameter. Must be a positive integer.`
    });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateCreatePost,
  validateCreateComment,
  validateIdParam
};
