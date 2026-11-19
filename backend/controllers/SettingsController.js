const UserSettings = require('../models/UserSettings');

// @desc    Get user settings
// @route   GET /api/settings
// @access  Private
exports.getSettings = async (req, res, next) => {
  try {
    let settings = await UserSettings.findOne({ user: req.user.id });
    if (!settings) {
      settings = await UserSettings.create({ user: req.user.id });
    }

    res.status(200).json({
      success: true,
      message: 'Settings loaded',
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user settings
// @route   PATCH /api/settings
// @access  Private
exports.updateSettings = async (req, res, next) => {
  try {
    const allowedUpdates = [
      'notifications', 
      'theme', 
      'sessionReminders', 
      'preferredSessionDuration', 
      'privacyPreferences'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    let settings = await UserSettings.findOneAndUpdate(
      { user: req.user.id },
      { $set: updates },
      { new: true, runValidators: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });
  } catch (error) {
    next(error);
  }
};
