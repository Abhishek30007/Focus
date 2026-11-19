const mongoose = require('mongoose');

const userSettingsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  notifications: {
    email: { type: Boolean, default: true },
    reminders: { type: Boolean, default: true }
  },
  theme: {
    type: String,
    enum: ['dark', 'light'],
    default: 'dark'
  },
  sessionReminders: {
    type: Boolean,
    default: true
  },
  preferredSessionDuration: {
    type: Number,
    default: 25 // minutes
  },
  privacyPreferences: {
    shareProgress: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('UserSettings', userSettingsSchema);
