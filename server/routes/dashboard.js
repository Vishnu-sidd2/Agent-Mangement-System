import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);
router.use(adminMiddleware);

// @route   GET /api/dashboard/stats
// @desc    Get dashboard stats
// @access  Private/Admin
router.get('/stats', getDashboardStats);

export default router;