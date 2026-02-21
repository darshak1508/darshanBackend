const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Public routes (no authentication needed)
router.post('/register', authController.register);
router.post('/login', authController.login);        // Step 1: username + password → sends OTP, returns otpSessionId
router.post('/verify-otp', authController.verifyOtp); // Step 2: otpSessionId + otp → returns JWT

// Protected route (requires authentication)
router.get('/me', authMiddleware, authController.getCurrentUser);

module.exports = router;
