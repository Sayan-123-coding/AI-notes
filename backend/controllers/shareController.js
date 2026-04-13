import Share from '../models/Share.js';
import Note from '../models/Note.js';
import User from '../models/User.js';

// Share a note with another user
export const shareNote = async (req, res) => {
    try {
        const { noteId, email, permission } = req.body;
        const ownerId = req.userId;

        // Validate input
        if (!noteId || !email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide note ID and email to share with',
                error: 'Missing required fields'
            });
        }

        // Check if note exists and belongs to user
        const note = await Note.findById(noteId);
        if (!note) {
            return res.status(404).json({
                success: false,
                message: 'Note not found',
                error: 'Note does not exist'
            });
        }

        if (note.userId.toString() !== ownerId) {
            return res.status(403).json({
                success: false,
                message: 'You can only share your own notes',
                error: 'Unauthorized'
            });
        }

        // Find user by email to share with
        const sharedWithUser = await User.findOne({ email });
        if (!sharedWithUser) {
            return res.status(404).json({
                success: false,
                message: `No user found with email: ${email}`,
                error: 'User not found'
            });
        }

        // Prevent sharing note with self
        if (sharedWithUser._id.toString() === ownerId) {
            return res.status(400).json({
                success: false,
                message: 'You cannot share a note with yourself',
                error: 'Invalid share'
            });
        }

        // Check if already shared
        const existingShare = await Share.findOne({
            noteId,
            sharedWithId: sharedWithUser._id
        });

        if (existingShare) {
            return res.status(400).json({
                success: false,
                message: 'This note is already shared with that user',
                error: 'Already shared'
            });
        }

        // Create share record
        const share = await Share.create({
            noteId,
            ownerId,
            sharedWithId: sharedWithUser._id,
            permission: permission || 'view'
        });

        // Populate user info
        await share.populate(['ownerId', 'sharedWithId', 'noteId']);

        res.status(201).json({
            success: true,
            message: 'Note shared successfully',
            data: share
        });
    } catch (error) {
        console.error('Share note error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to share note',
            error: error.message
        });
    }
};

// Get all shares for a note (shared with whom)
export const getNoteShares = async (req, res) => {
    try {
        const { noteId } = req.params;
        const userId = req.userId;

        // Verify ownership
        const note = await Note.findById(noteId);
        if (!note || note.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized',
                error: 'Not the note owner'
            });
        }

        // Get all shares for this note
        const shares = await Share.find({ noteId })
            .populate('sharedWithId', 'username email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            message: 'Shares retrieved successfully',
            data: shares
        });
    } catch (error) {
        console.error('Get note shares error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve shares',
            error: error.message
        });
    }
};

// Get all notes shared with current user
export const getSharedWithMe = async (req, res) => {
    try {
        const userId = req.userId;
        const { page = 1, limit = 10, search = '', sort = 'date' } = req.query;
        const skip = (page - 1) * limit;

        // Find all shares where current user is recipient
        let shareQuery = Share.find({ sharedWithId: userId })
            .populate({
                path: 'noteId',
                match: search ? {
                    $or: [
                        { text: { $regex: search, $options: 'i' } },
                        { summary: { $regex: search, $options: 'i' } }
                    ]
                } : {}
            })
            .populate('ownerId', 'username email');

        // Get total count before pagination
        const totalShares = await Share.countDocuments({ sharedWithId: userId });

        // Apply sorting
        let sortOption = { createdAt: -1 }; // default: newest first
        if (sort === 'oldest') sortOption = { createdAt: 1 };
        if (sort === 'alphabetical') sortOption = { 'noteId.text': 1 };
        if (sort === 'alphabetical-desc') sortOption = { 'noteId.text': -1 };

        const shares = await shareQuery
            .sort(sortOption)
            .skip(skip)
            .limit(parseInt(limit));

        // Filter out null noteIds (deleted notes)
        const validShares = shares.filter(s => s.noteId !== null);

        // Transform response to include note and share info
        const sharedNotes = validShares.map(share => ({
            ...share.noteId.toObject(),
            sharedBy: share.ownerId,
            sharedAt: share.createdAt,
            permission: share.permission,
            shareId: share._id
        }));

        res.json({
            success: true,
            message: 'Shared notes retrieved successfully',
            data: sharedNotes,
            pagination: {
                current: parseInt(page),
                limit: parseInt(limit),
                total: totalShares,
                totalPages: Math.ceil(totalShares / limit),
                hasNextPage: page * limit < totalShares,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error('Get shared with me error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve shared notes',
            error: error.message
        });
    }
};

// Revoke share (unshare)
export const revokeShare = async (req, res) => {
    try {
        const { shareId } = req.params;
        const userId = req.userId;

        // Find share and verify ownership of note
        const share = await Share.findById(shareId).populate('noteId');
        if (!share) {
            return res.status(404).json({
                success: false,
                message: 'Share not found',
                error: 'Share does not exist'
            });
        }

        if (share.ownerId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only revoke shares for your own notes',
                error: 'Unauthorized'
            });
        }

        // Delete the share
        await Share.findByIdAndDelete(shareId);

        res.json({
            success: true,
            message: 'Share revoked successfully',
            data: share
        });
    } catch (error) {
        console.error('Revoke share error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to revoke share',
            error: error.message
        });
    }
};

// Get share info (check if note is shared with specific user)
export const getShareInfo = async (req, res) => {
    try {
        const { noteId } = req.params;
        const userId = req.userId;

        // Verify ownership
        const note = await Note.findById(noteId);
        if (!note || note.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized',
                error: 'Not the note owner'
            });
        }

        // Get all users this note is shared with
        const shares = await Share.find({ noteId })
            .select('sharedWithId permission')
            .populate('sharedWithId', 'username email');

        res.json({
            success: true,
            message: 'Share info retrieved',
            data: shares
        });
    } catch (error) {
        console.error('Get share info error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get share info',
            error: error.message
        });
    }
};
