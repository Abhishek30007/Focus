const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'revoked', 'expired'],
    default: 'active',
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  replacedByToken: {
    type: String,
    default: null
  },
  createdByIp: {
    type: String,
    default: ''
  },
  revokedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Compound indexes for high performance lookup and cleanup
refreshTokenSchema.index({ user: 1, status: 1, expiresAt: -1 });
refreshTokenSchema.index({ token: 1, status: 1 });

refreshTokenSchema.methods.isValid = function() {
  return this.status === 'active' && this.expiresAt > new Date();
};

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);

