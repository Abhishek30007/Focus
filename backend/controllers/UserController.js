const User = require('../models/User');
const UserSettings = require('../models/UserSettings');
const FocusSession = require('../models/FocusSession');
const Progress = require('../models/Progress');
const Notification = require('../models/Notification');

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user profile
// @route   PATCH /api/users/me
// @access  Private
exports.updateUserProfile = async (req, res, next) => {
  try {
    const allowedUpdates = [
      'name', 
      'email', 
      'profileImage', 
      'preferredFocusDuration', 
      'meditationPreferences', 
      'notificationPreferences'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/me
// @access  Private
exports.deleteUserAccount = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Remove user profile
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      });
    }

    // Cascade delete user data to maintain DB hygiene
    await UserSettings.findOneAndDelete({ user: userId });
    await FocusSession.deleteMany({ user: userId });
    await Progress.deleteMany({ user: userId });
    await Notification.deleteMany({ user: userId });

    // Clear authentication cookie
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 5000),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      message: 'Account and associated data deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
