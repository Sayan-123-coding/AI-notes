import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  exportAsJSON,
  exportAsCSV,
  exportAsMarkdown
} from '../controllers/exportController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Export as JSON
router.get('/json', exportAsJSON);

// Export as CSV
router.get('/csv', exportAsCSV);

// Export as Markdown
router.get('/markdown', exportAsMarkdown);

export default router;
