/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {boolean} - True if password meets strength requirements
 */
const validatePasswordStrength = (password) => {
  if (!password || typeof password !== 'string') return false;
  
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  
  return true;
};

/**
 * Validate user role
 * @param {string} role - Role to validate
 * @returns {boolean} - True if valid role
 */
const isValidRole = (role) => {
  const validRoles = ['student', 'instructor', 'admin'];
  return validRoles.includes(role);
};

/**
 * Validate course level
 * @param {string} level - Level to validate
 * @returns {boolean} - True if valid level
 */
const isValidCourseLevel = (level) => {
  const validLevels = ['beginner', 'intermediate', 'advanced'];
  return validLevels.includes(level);
};

/**
 * Validate pagination parameters
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {object} - Validated parameters with defaults
 */
const validatePaginationParams = (page = 1, limit = 10) => {
  let validPage = parseInt(page) || 1;
  let validLimit = parseInt(limit) || 10;

  // Ensure minimum values
  validPage = Math.max(1, validPage);
  validLimit = Math.max(1, Math.min(100, validLimit)); // Max 100 per page

  return {
    page: validPage,
    limit: validLimit,
    skip: (validPage - 1) * validLimit
  };
};

/**
 * Sanitize user input
 * @param {string} input - Input to sanitize
 * @returns {string} - Sanitized input
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .slice(0, 1000); // Limit length
};

/**
 * Generate slug from text
 * @param {string} text - Text to convert to slug
 * @returns {string} - Slug
 */
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/--+/g, '-');
};

module.exports = {
  isValidEmail,
  validatePasswordStrength,
  isValidRole,
  isValidCourseLevel,
  validatePaginationParams,
  sanitizeInput,
  generateSlug
};
