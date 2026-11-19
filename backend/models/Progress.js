const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date, // Normalized to YYYY-MM-DD
    required: true
  },
  focusMinutes: {
    type: Number,
    default: 0
  },
  meditationMinutes: {
    type: Number,
    default: 0
  },
  completedSessions: {
    type: Number,
    default: 0
  },
  focusScore: {
    type: Number, // 0 to 100 representing attention quality
    default: 0
  }
}, {
  timestamps: true
});

// Compound index to ensure one progress entry per user per day
progressSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
