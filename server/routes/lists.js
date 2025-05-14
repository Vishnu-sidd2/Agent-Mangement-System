import express from 'express';
import { 
  upload, 
  processUploadedFile, 
  getAllLists, 
  getListDistribution,
  downloadList,
  downloadAgentList
} from '../controllers/listController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);
router.use(adminMiddleware);

// @route   POST /api/lists/upload
// @desc    Upload and process a file
// @access  Private/Admin
router.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    processUploadedFile(req, res);
  });
});

// @route   GET /api/lists
// @desc    Get all lists
// @access  Private/Admin
router.get('/', getAllLists);

// @route   GET /api/lists/:id/distribution
// @desc    Get list distribution
// @access  Private/Admin
router.get('/:id/distribution', getListDistribution);

// @route   GET /api/lists/:id/download
// @desc    Download full list as CSV
// @access  Private/Admin
router.get('/:id/download', downloadList);

// @route   GET /api/lists/:id/download/:agentId
// @desc    Download agent's list as CSV
// @access  Private/Admin
router.get('/:id/download/:agentId', downloadAgentList);

export default router;