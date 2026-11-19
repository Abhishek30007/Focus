const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes via Bearer JWT access token
 * Verifies access token, fetches user (lean projection without password), attaches to req.user
 */
const authenticate = async (req, res, next) => {
  let token;

  // 1. Extract Bearer token from Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    // Fallback to cookie if present
    token = req.cookies.accessToken;
  } else if (req.cookies && req.cookies.token) {
    // Backwards compatibility with previous session token cookie
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
      error: {
        code: 'UNAUTHORIZED',
        message: 'No authorization token provided'
      }
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET || 'development_jwt_secret_key_12345'
    );

    // Optimized lean query excluding password
    const user = await User.findById(decoded.id || decoded.userId).select('-password').lean();

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists',
        error: {
          code: 'USER_NOT_FOUND',
          message: 'The user assigned to this token does not exist'
        }
      });
    }

    user.id = user._id.toString();
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: {
        code: error.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN',
        message: error.message || 'Token verification failed'
      }
    });
  }
};

module.exports = { authenticate, protect: authenticate };
