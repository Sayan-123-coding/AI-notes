import mongoose from 'mongoose';

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a tag name'],
      trim: true,
      minlength: [2, 'Tag name must be at least 2 characters'],
      maxlength: [20, 'Tag name must not exceed 20 characters']
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    color: {
      type: String,
      default: '#6366f1',
      match: [/^#(?:[0-9a-fA-F]{3}){1,2}$/, 'Please provide a valid hex color']
    },
    icon: {
      type: String,
      default: '🏷️'
    }
  },
  {
    timestamps: true
  }
);

// Unique constraint on userId and name
tagSchema.index({ userId: 1, name: 1 }, { unique: true });

export default mongoose.model('Tag', tagSchema);
