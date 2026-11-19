const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Session title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Session description is required']
  },
  category: {
    type: String,
    enum: ['Calm', 'Focus', 'Flow', 'Meditation'],
    required: [true, 'Session category is required']
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Session duration is required']
  },
  guidedInstructions: {
    type: [String], // Step-by-step guided instructions or reminders shown during the timer
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Session', sessionSchema);
