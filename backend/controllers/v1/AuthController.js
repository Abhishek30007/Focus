const authService = require('../../services/authService');
const UserDTO = require('../../dtos/userDto');

const REFRESH_COOKIE_NAME = 'refreshToken';

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/api/v1/auth/refresh',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});

class AuthController {
  constructor(service = authService) {
    this.service = service;
  }

  signup = async (req, res, next) => {
    try {
      const { name, email, password } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;

      const result = await this.service.signup({ name, email, password, ipAddress });

      // Attach refresh token cookie with SameSite=Strict and httpOnly
      res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, getCookieOptions());

      // Backwards compatibility cookie for existing frontend if needed
      res.cookie('token', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: UserDTO.toResponse(result.user),
          accessToken: result.accessToken,
          token: result.accessToken // Backwards compatibility alias
        }
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;

      const result = await this.service.login({ email, password, ipAddress });

      // Attach refresh token cookie
      res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, getCookieOptions());

      // Backwards compatibility cookie
      res.cookie('token', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.status(200).json({
        success: true,
        message: 'Logged in successfully',
        data: {
          user: UserDTO.toResponse(result.user),
          accessToken: result.accessToken,
          token: result.accessToken // Backwards compatibility alias
        }
      });
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req, res, next) => {
    try {
      const refreshToken = req.cookies[REFRESH_COOKIE_NAME] || req.body.refreshToken || req.headers['x-refresh-token'];
      const ipAddress = req.ip || req.connection.remoteAddress;

      const result = await this.service.refresh({ refreshToken, ipAddress });

      // Rotate cookie with new refresh token
      res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, getCookieOptions());

      res.status(200).json({
        success: true,
        message: 'Tokens rotated successfully',
        data: {
          accessToken: result.accessToken,
          user: UserDTO.toResponse(result.user)
        }
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req, res, next) => {
    try {
      const refreshToken = req.cookies[REFRESH_COOKIE_NAME] || req.body.refreshToken;
      const userId = req.user ? (req.user._id || req.user.id) : null;

      await this.service.logout({ refreshToken, userId });

      // Clear refresh cookie
      res.clearCookie(REFRESH_COOKIE_NAME, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/api/v1/auth/refresh'
      });

      // Clear legacy token cookie
      res.clearCookie('token');

      res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new AuthController();

