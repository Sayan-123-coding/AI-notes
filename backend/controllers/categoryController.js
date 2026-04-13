import Category from '../models/Category.js';

// CREATE - Add new category
export const createCategory = async (req, res) => {
    try {
        const { name, color, icon } = req.body;

        // Validation
        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Category name is required',
                error: 'Missing name'
            });
        }

        if (name.length < 2 || name.length > 20) {
            return res.status(400).json({
                success: false,
                message: 'Category name must be 2-20 characters',
                error: 'Invalid length'
            });
        }

        // Check for duplicate name in user's categories
        const existingCategory = await Category.findOne({
            userId: req.userId,
            name: { $regex: `^${name}$`, $options: 'i' }
        });

        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'Category with this name already exists',
                error: 'Duplicate name'
            });
        }

        // Create category
        const category = await Category.create({
            name,
            color: color || '#3b82f6',
            icon: icon || '📁',
            userId: req.userId
        });

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: category
        });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create category',
            error: error.message
        });
    }
};

// READ - Get all user's categories
export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({ userId: req.userId }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: 'Categories retrieved successfully',
            data: categories
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve categories',
            error: error.message
        });
    }
};

// UPDATE - Update category
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, color, icon } = req.body;

        // Find category
        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found',
                error: 'No category with this ID'
            });
        }

        // Check ownership
        if (category.userId.toString() !== req.userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this category',
                error: 'Forbidden'
            });
        }

        // Validate new name if provided
        if (name && name !== category.name) {
            if (name.length < 2 || name.length > 20) {
                return res.status(400).json({
                    success: false,
                    message: 'Category name must be 2-20 characters',
                    error: 'Invalid length'
                });
            }

            const existingCategory = await Category.findOne({
                _id: { $ne: id },
                userId: req.userId,
                name: { $regex: `^${name}$`, $options: 'i' }
            });

            if (existingCategory) {
                return res.status(400).json({
                    success: false,
                    message: 'Category with this name already exists',
                    error: 'Duplicate name'
                });
            }
        }

        // Update
        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            {
                ...(name && { name }),
                ...(color && { color }),
                ...(icon && { icon })
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Category updated successfully',
            data: updatedCategory
        });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update category',
            error: error.message
        });
    }
};

// DELETE - Delete category
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found',
                error: 'No category with this ID'
            });
        }

        // Check ownership
        if (category.userId.toString() !== req.userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this category',
                error: 'Forbidden'
            });
        }

        await Category.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Category deleted successfully',
            data: category
        });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete category',
            error: error.message
        });
    }
};
