const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const userRepository = require('../repositories/userRepository');
const refreshTokenRepository = require('../repositories/refreshTokenRepository');
const UserSettings = require('../models/UserSettings');

class AuthService {
  constructor(userRepo = userRepository, tokenRepo = refreshTokenRepository) {
    this.userRepo = userRepo;
    this.tokenRepo = tokenRepo;
  }

  generateTokens(user) {
    const payload = {
      id: user._id ? user._id.toString() : user.id,
      email: user.email
    };

    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET || 'development_jwt_secret_key_12345';
    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET || 'development_jwt_secret_key_12345';

    // 15m Access Token
    const accessToken = jwt.sign(payload, accessTokenSecret, {
      expiresIn: '15m'
    });

    // 7d Refresh Token
    const refreshToken = jwt.sign(
      { ...payload, jti: crypto.randomBytes(16).toString('hex') },
      refreshTokenSecret,
      { expiresIn: '7d' }
    );

    const refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    return {
      accessToken,
      refreshToken,
      refreshTokenExpiresAt
    };
  }

  async signup({ name, email, password, ipAddress = '' }) {
    const existing = await this.userRepo.findByEmail(email);
    if (existing) {
      const error = new Error('An account with that email already exists');
      error.statusCode = 400;
      error.code = 'EMAIL_ALREADY_EXISTS';
      throw error;
    }

    const user = await this.userRepo.create({ name, email, password });

    // Initialize user settings
    try {
      await UserSettings.create({ user: user._id });
    } catch (_) {}

    const { accessToken, refreshToken, refreshTokenExpiresAt } = this.generateTokens(user);

    await this.tokenRepo.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: refreshTokenExpiresAt,
      createdByIp: ipAddress
    });

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      },
      accessToken,
      refreshToken
    };
  }

  async login({ email, password, ipAddress = '' }) {
    const user = await this.userRepo.findByEmail(email, true);
    if (!user) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    const { accessToken, refreshToken, refreshTokenExpiresAt } = this.generateTokens(user);

    await this.tokenRepo.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: refreshTokenExpiresAt,
      createdByIp: ipAddress
    });

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      },
      accessToken,
      refreshToken
    };
  }

  async refresh({ refreshToken, ipAddress = '' }) {
    if (!refreshToken) {
      const error = new Error('Refresh token is required');
      error.statusCode = 401;
      error.code = 'REFRESH_TOKEN_REQUIRED';
      throw error;
    }

    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET || 'development_jwt_secret_key_12345';
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, refreshTokenSecret);
    } catch (err) {
      const error = new Error('Invalid or expired refresh token');
      error.statusCode = 401;
      error.code = 'INVALID_REFRESH_TOKEN';
      throw error;
    }

    const storedToken = await this.tokenRepo.findActiveByToken(refreshToken);
    if (!storedToken) {
      const error = new Error('Refresh token revoked or inactive');
      error.statusCode = 401;
      error.code = 'TOKEN_REVOKED';
      throw error;
    }

    const user = await this.userRepo.findById(decoded.id);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 401;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    // Silent Token Rotation: Generate new token pair, invalidate previous refresh token
    const newTokens = this.generateTokens(user);

    await this.tokenRepo.revoke(refreshToken, newTokens.refreshToken);

    await this.tokenRepo.create({
      userId: user._id,
      token: newTokens.refreshToken,
      expiresAt: newTokens.refreshTokenExpiresAt,
      createdByIp: ipAddress
    });

    return {
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
      user
    };
  }

  async logout({ refreshToken, userId }) {
    if (refreshToken) {
      await this.tokenRepo.revoke(refreshToken);
    } else if (userId) {
      await this.tokenRepo.revokeAllForUser(userId);
    }
    return { success: true };
  }
}

module.exports = new AuthService();

