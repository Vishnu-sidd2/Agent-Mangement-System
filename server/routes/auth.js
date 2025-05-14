import express from 'express';
import { body } from 'express-validator';
import { loginUser, verifyToken } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  '/login',
  [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').exists()
  ],
  loginUser
);

// @route   GET /api/auth/verify
// @desc    Verify token
// @access  Private
router.get('/verify', authMiddleware, verifyToken);

export default router;