import Tag from "../models/Tag.js";
import Note from "../models/Note.js";

// CREATE TAG
export const createTag = async (req, res) => {
  try {
    const { name, color = "#6366f1", icon = "🏷️" } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Tag name is required"
      });
    }

    // Check for duplicate tag name for this user
    const existingTag = await Tag.findOne({
      userId: req.userId,
      name: { $regex: `^${name.trim()}$`, $options: "i" }
    });

    if (existingTag) {
      return res.status(400).json({
        success: false,
        message: "Tag with this name already exists"
      });
    }

    const tag = await Tag.create({
      name: name.trim(),
      color,
      icon,
      userId: req.userId
    });

    res.status(201).json({
      success: true,
      message: "Tag created successfully",
      data: tag
    });
  } catch (error) {
    console.error("Create Tag Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to create tag",
      error: error.message
    });
  }
};

// GET ALL TAGS WITH STATS
export const getTags = async (req, res) => {
  try {
    const tags = await Tag.find({ userId: req.userId }).sort({ createdAt: -1 });

    // Get usage count for each tag
    const tagsWithStats = await Promise.all(
      tags.map(async (tag) => {
        const count = await Note.countDocuments({
          userId: req.userId,
          tags: tag.name
        });
        return {
          ...tag.toObject(),
          usageCount: count
        };
      })
    );

    res.status(200).json({
      success: true,
      message: "Tags retrieved successfully",
      data: tagsWithStats
    });
  } catch (error) {
    console.error("Get Tags Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve tags",
      error: error.message
    });
  }
};

// UPDATE TAG
export const updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color, icon } = req.body;

    const tag = await Tag.findById(id);
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: "Tag not found"
      });
    }

    if (tag.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this tag"
      });
    }

    // Check for duplicate name if changing it
    if (name && name.trim() !== tag.name) {
      const existingTag = await Tag.findOne({
        userId: req.userId,
        name: { $regex: `^${name.trim()}$`, $options: "i" },
        _id: { $ne: id }
      });

      if (existingTag) {
        return res.status(400).json({
          success: false,
          message: "Tag with this name already exists"
        });
      }

      // Update tag name in all notes and the tag itself
      const oldName = tag.name;
      const newName = name.trim();

      // Update notes with old tag name to new tag name
      await Note.updateMany(
        { userId: req.userId, tags: oldName },
        { $pull: { tags: oldName } }
      );

      await Note.updateMany(
        { userId: req.userId },
        { $push: { tags: newName } },
        { arrayFilters: [{ "tags": oldName }] }
      );

      tag.name = newName;
    }

    if (color) tag.color = color;
    if (icon) tag.icon = icon;

    await tag.save();

    res.status(200).json({
      success: true,
      message: "Tag updated successfully",
      data: tag
    });
  } catch (error) {
    console.error("Update Tag Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to update tag",
      error: error.message
    });
  }
};

// DELETE TAG
export const deleteTag = async (req, res) => {
  try {
    const { id } = req.params;

    const tag = await Tag.findById(id);
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: "Tag not found"
      });
    }

    if (tag.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this tag"
      });
    }

    // Remove tag from all notes
    await Note.updateMany(
      { userId: req.userId, tags: tag.name },
      { $pull: { tags: tag.name } }
    );

    await Tag.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Tag deleted successfully",
      data: tag
    });
  } catch (error) {
    console.error("Delete Tag Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to delete tag",
      error: error.message
    });
  }
};

// GET TAG STATS
export const tagStats = async (req, res) => {
  try {
    const tags = await Tag.find({ userId: req.userId });
    const stats = [];

    for (const tag of tags) {
      const noteCount = await Note.countDocuments({
        userId: req.userId,
        tags: tag.name
      });

      stats.push({
        tagId: tag._id,
        name: tag.name,
        color: tag.color,
        icon: tag.icon,
        noteCount,
        createdAt: tag.createdAt
      });
    }

    res.status(200).json({
      success: true,
      message: "Tag statistics retrieved successfully",
      data: stats
    });
  } catch (error) {
    console.error("Tag Stats Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve tag statistics",
      error: error.message
    });
  }
};
