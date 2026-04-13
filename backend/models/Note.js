import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Please provide note text']
  },
  content: String,
  contentType: {
    type: String,
    enum: ['plain', 'rich'],
    default: 'plain'
  },
  summary: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  isFavorited: {
    type: Boolean,
    default: false,
    index: true
  },
  isArchived: {
    type: Boolean,
    default: false,
    index: true
  },
  tags: [{
    type: String,
    trim: true,
    minlength: [2, 'Tag must be at least 2 characters'],
    maxlength: [20, 'Tag must not exceed 20 characters']
  }],
  wordCount: {
    type: Number,
    default: 0
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, { timestamps: true });

// Compound indexes for efficient querying
noteSchema.index({ userId: 1, isArchived: 1 });
noteSchema.index({ userId: 1, isFavorited: 1 });
noteSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Note", noteSchema);