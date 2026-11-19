const express = require('express');
const router = express.Router();
const authController = require('../../controllers/v1/AuthController');
const { validate } = require('../../middleware/validate');
const { authenticate } = require('../../middleware/auth');
const { signupSchema, loginSchema, refreshSchema } = require('../../validation/schemas');

// 1. POST /api/v1/auth/signup
router.post('/signup', validate(signupSchema), authController.signup);

// 2. POST /api/v1/auth/login
router.post('/login', validate(loginSchema), authController.login);

// 3. POST /api/v1/auth/refresh (Silent token rotation)
router.post('/refresh', validate(refreshSchema), authController.refresh);

// 4. POST /api/v1/auth/logout
router.post('/logout', authController.logout);

module.exports = router;

