const express = require('express');
const router = express.Router();
const { 
  signup, 
  login, 
  logout, 
  getMe, 
  refresh, 
  forgotPassword, 
  resetPassword 
} = require('../controllers/AuthController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.post('/refresh', protect, refresh);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
