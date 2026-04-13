import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  createTag,
  getTags,
  updateTag,
  deleteTag,
  tagStats
} from '../controllers/tagController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Create tag
router.post('/', createTag);

// Get all tags with stats
router.get('/', getTags);

// Get tag statistics
router.get('/stats', tagStats);

// Update tag
router.put('/:id', updateTag);

// Delete tag
router.delete('/:id', deleteTag);

export default router;
