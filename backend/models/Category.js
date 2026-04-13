import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a category name'],
            trim: true,
            minlength: [2, 'Category name must be at least 2 characters'],
            maxlength: [20, 'Category name must not exceed 20 characters']
        },
        color: {
            type: String,
            default: '#3b82f6',
            match: [/^#(?:[0-9a-fA-F]{3}){1,2}$/, 'Please provide a valid hex color']
        },
        icon: {
            type: String,
            default: '📁'
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required']
        }
    },
    {
        timestamps: true
    }
);

// Unique index on name per user (user can't have duplicate category names)
categorySchema.index({ userId: 1, name: 1 }, { unique: true });

const Category = mongoose.model('Category', categorySchema);
export default Category;
