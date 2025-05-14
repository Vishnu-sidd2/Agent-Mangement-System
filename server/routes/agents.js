import express from 'express';
import { body } from 'express-validator';
import { 
  getAllAgents, 
  getAgentById, 
  createAgent, 
  updateAgent, 
  deleteAgent 
} from '../controllers/agentController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);
router.use(adminMiddleware);

// @route   GET /api/agents
// @desc    Get all agents
// @access  Private/Admin
router.get('/', getAllAgents);

// @route   GET /api/agents/:id
// @desc    Get agent by ID
// @access  Private/Admin
router.get('/:id', getAgentById);

// @route   POST /api/agents
// @desc    Create agent
// @access  Private/Admin
router.post(
  '/',
  [
    body('name', 'Name is required').not().isEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('mobile', 'Mobile number is required').not().isEmpty(),
    body('password', 'Password must be at least 6 characters').isLength({ min: 6 })
  ],
  createAgent
);

// @route   PUT /api/agents/:id
// @desc    Update agent
// @access  Private/Admin
router.put(
  '/:id',
  [
    body('name', 'Name is required').optional().not().isEmpty(),
    body('email', 'Please include a valid email').optional().isEmail(),
    body('mobile', 'Mobile number is required').optional().not().isEmpty(),
    body('password', 'Password must be at least 6 characters').optional().isLength({ min: 6 })
  ],
  updateAgent
);

// @route   DELETE /api/agents/:id
// @desc    Delete agent
// @access  Private/Admin
router.delete('/:id', deleteAgent);

export default router;