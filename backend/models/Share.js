import mongoose from 'mongoose';

const shareSchema = new mongoose.Schema(
    {
        noteId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Note',
            required: [true, 'Please provide a note ID'],
            index: true
        },
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Please provide owner ID'],
            index: true
        },
        sharedWithId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Please provide user ID to share with'],
            index: true
        },
        permission: {
            type: String,
            enum: ['view', 'edit'],
            default: 'view'
        }
    },
    {
        timestamps: true
    }
);

// Compound unique index: prevent duplicate shares of same note to same user
shareSchema.index({ noteId: 1, sharedWithId: 1 }, { unique: true });

const Share = mongoose.model('Share', shareSchema);
export default Share;
