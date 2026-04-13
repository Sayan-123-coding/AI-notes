import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    noteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Note',
      required: [true, 'Note ID is required'],
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    action: {
      type: String,
      enum: ['created', 'updated', 'deleted', 'shared', 'archived', 'unarchived', 'favorited', 'unfavorited'],
      required: [true, 'Action is required']
    },
    changeDetails: {
      type: Object,
      default: null
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

// Compound index for efficient querying
activityLogSchema.index({ noteId: 1, createdAt: -1 });

export default mongoose.model('ActivityLog', activityLogSchema);
