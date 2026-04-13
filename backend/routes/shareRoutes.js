import express from 'express';
import { shareNote, getNoteShares, getSharedWithMe, revokeShare, getShareInfo } from '../controllers/shareController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All share routes are protected
router.use(protect);

// Share a note with another user
router.post('/', shareNote);

// Get all shares for a specific note (who it's shared with)
router.get('/note/:noteId', getNoteShares);

// Get all notes shared with current user
router.get('/shared-with-me', getSharedWithMe);

// Get share info for a note
router.get('/info/:noteId', getShareInfo);

// Revoke a share
router.delete('/:shareId', revokeShare);

export default router;
