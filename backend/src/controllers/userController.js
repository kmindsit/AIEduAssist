const User = require('../models/User');
const { validatePaginationParams } = require('../utils/validators');

/**
 * Get user profile
 * GET /api/users/profile
 */
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .populate('enrolledCourses', 'title category level')
      .populate('completedCourses', 'title category')
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        statusCode: 404
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve profile',
      statusCode: 500
    });
  }
};

/**
 * Update user profile
 * PUT /api/users/profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, bio, phone, location, avatar } = req.body;

    // Validate input
    if (name && name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Name must be at least 2 characters',
        statusCode: 400
      });
    }

    if (bio && bio.length > 500) {
      return res.status(400).json({
        success: false,
        error: 'Bio must not exceed 500 characters',
        statusCode: 400
      });
    }

    // Build update object
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (bio !== undefined) updateData.bio = bio;
    if (phone) updateData.phone = phone;
    if (location) updateData.location = location;
    if (avatar) updateData.avatar = avatar;

    // Update user
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        statusCode: 404
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update profile',
      statusCode: 500
    });
  }
};

/**
 * Get user details (Admin only)
 * GET /api/users/:id
 */
exports.getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .populate('enrolledCourses', 'title category level')
      .populate('completedCourses', 'title category')
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        statusCode: 404
      });
    }

    res.status(200).json({
      success: true,
      message: 'User details retrieved successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve user details',
      statusCode: 500
    });
  }
};

/**
 * Get all users (Admin only)
 * GET /api/users?page=1&limit=10&role=student
 */
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, isActive } = req.query;
    const { skip, limit: validLimit } = validatePaginationParams(page, limit);

    // Build query
    const query = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    // Get total count
    const total = await User.countDocuments(query);

    // Get users
    const users = await User.find(query)
      .select('-password')
      .limit(validLimit)
      .skip(skip)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users,
        pagination: {
          total,
          page: parseInt(page),
          limit: validLimit,
          pages: Math.ceil(total / validLimit)
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve users',
      statusCode: 500
    });
  }
};

/**
 * Deactivate user account (Admin only)
 * PUT /api/users/:id/deactivate
 */
exports.deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        statusCode: 404
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to deactivate user',
      statusCode: 500
    });
  }
};

/**
 * Get user statistics
 * GET /api/users/:id/stats
 */
exports.getUserStats = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        statusCode: 404
      });
    }

    const stats = {
      totalEnrolledCourses: user.enrolledCourses?.length || 0,
      totalCompletedCourses: user.completedCourses?.length || 0,
      totalCertificates: user.certificates?.length || 0,
      memberSince: user.createdAt,
      lastActive: user.lastLogin,
      accountStatus: user.isActive ? 'active' : 'inactive'
    };

    res.status(200).json({
      success: true,
      message: 'User statistics retrieved successfully',
      data: { stats }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve user statistics',
      statusCode: 500
    });
  }
};

/**
 * Delete user account (Admin only)
 * DELETE /api/users/:id
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        statusCode: 404
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete user',
      statusCode: 500
    });
  }
};
