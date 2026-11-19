const mongoose = require('mongoose');

const breathRatiosSchema = new mongoose.Schema({
  inhale: { type: Number, default: 4 },
  hold: { type: Number, default: 4 },
  exhale: { type: Number, default: 4 },
  postHold: { type: Number, default: 0 }
}, { _id: false });

const stageSchema = new mongoose.Schema({
  secondOffset: { type: Number, required: true },
  cue: { type: String, required: true },
  tone: { type: String, default: 'calm' }
}, { _id: false });

const focusSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: false
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  tradition: {
    type: String,
    enum: ['pranayama', 'yoga_nidra', 'vipassana', 'trataka', 'general'],
    default: 'general',
    index: true
  },
  category: {
    type: String,
    enum: ['Calm', 'Focus', 'Flow', 'Meditation'],
    default: 'Meditation'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number, // total intended duration in minutes
    required: true
  },
  durationCompleted: {
    type: Number, // seconds completed
    default: 0
  },
  completed: {
    type: Boolean,
    default: false,
    index: true
  },
  // Baseline biomarkers
  baselineHeartRate: {
    type: Number,
    default: null
  },
  baselineHrv: {
    type: Number,
    default: null
  },
  baselineCalmScore: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  moodBefore: {
    type: String,
    default: ''
  },
  // Exit biomarkers
  exitHeartRate: {
    type: Number,
    default: null
  },
  exitHrv: {
    type: Number,
    default: null
  },
  exitCalmScore: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  moodAfter: {
    type: String,
    default: ''
  },
  // Computed deltas
  heartRateDelta: {
    type: Number,
    default: 0
  },
  hrvDelta: {
    type: Number,
    default: 0
  },
  calmDelta: {
    type: Number,
    default: 0
  },
  breathSyncScore: {
    type: Number, // 0 - 100 percentage
    default: 85
  },
  breathRatios: {
    type: breathRatiosSchema,
    default: () => ({ inhale: 4, hold: 4, exhale: 4, postHold: 0 })
  },
  stages: {
    type: [stageSchema],
    default: []
  },
  summary: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Auto-sync userId with user ObjectId
focusSessionSchema.pre('save', function(next) {
  if (this.user && !this.userId) {
    this.userId = this.user;
  }
  next();
});

// Latency reduction compound indexes:
focusSessionSchema.index({ userId: 1, createdAt: -1 });
focusSessionSchema.index({ user: 1, createdAt: -1 });
focusSessionSchema.index({ user: 1, completed: 1, createdAt: -1 });
focusSessionSchema.index({ tradition: 1, createdAt: -1 });

module.exports = mongoose.model('FocusSession', focusSessionSchema);
