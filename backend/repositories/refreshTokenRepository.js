const RefreshToken = require('../models/RefreshToken');

class RefreshTokenRepository {
  async create({ userId, token, expiresAt, createdByIp }) {
    return RefreshToken.create({
      user: userId,
      token,
      expiresAt,
      createdByIp,
      status: 'active'
    });
  }

  async findActiveByToken(token) {
    return RefreshToken.findOne({
      token,
      status: 'active',
      expiresAt: { $gt: new Date() }
    }).exec();
  }

  async revoke(token, replacedByToken = null) {
    return RefreshToken.findOneAndUpdate(
      { token },
      {
        status: 'revoked',
        revokedAt: new Date(),
        replacedByToken
      },
      { new: true }
    ).exec();
  }

  async revokeAllForUser(userId) {
    return RefreshToken.updateMany(
      { user: userId, status: 'active' },
      { status: 'revoked', revokedAt: new Date() }
    ).exec();
  }
}

module.exports = new RefreshTokenRepository();

