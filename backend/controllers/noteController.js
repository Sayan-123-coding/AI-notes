import Note from "../models/Note.js";
import ActivityLog from "../models/ActivityLog.js";
import axios from "axios";
import { logActivity } from "../utils/activityLogger.js";

// Helper function to calculate word count
const calculateWordCount = (text) => {
  if (!text) return 0;
  return text
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0)
    .length;
};

// Helper function to generate summary using Groq AI
const generateSummary = async (content) => {
  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: "Summarize this text:\n" + content
        }
      ]
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );

  return response.data.choices[0].message.content;
};

// CREATE + AI + SAVE
export const createNote = async (req, res) => {
  try {
    const { content, categoryId, tags = [] } = req.body;

    // 🔥 AI CALL
    const summary = await generateSummary(content);
    const wordCount = calculateWordCount(content);

    // 🔥 SAVE TO DB
    const newNote = await Note.create({
      text: content,
      summary,
      wordCount,
      tags: Array.isArray(tags) ? tags.filter(tag => tag.trim()).slice(0, 5) : [],
      userId: req.userId,
      ...(categoryId && { categoryId })
    });

    // Log activity
    await logActivity(newNote._id, req.userId, 'created');

    // Populate category if exists
    await newNote.populate('categoryId');

    res.status(201).json({
      success: true,
      message: "Note created successfully",
      data: newNote
    });

  } catch (error) {
    console.error("Create Note Error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "Failed to create note",
      error: error.response?.data?.error || "AI service error. Please try again."
    });
  }
};

// GET with Search, Sort, Pagination, and Category Filter
export const getNotes = async (req, res) => {
  try {
    // Extract query parameters
    const { search = "", sort = "date", page = 1, limit = 10, categoryId, isFavorited, isArchived, tags } = req.query;

    // Validate and parse page and limit
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10)); // Max 100 per page

    // Build search filter with userId
    let filter = { userId: req.userId };

    // Add archive filter (exclude archived by default unless requested)
    if (isArchived === "true") {
      filter.isArchived = true;
    } else if (isArchived !== "only") {
      filter.isArchived = false;
    }

    // Add favorite filter if requested
    if (isFavorited === "true") {
      filter.isFavorited = true;
    }

    // Add category filter if provided
    if (categoryId) {
      filter.categoryId = categoryId;
    }

    // Add tags filter if provided
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      if (tagArray.length > 0) {
        filter.tags = { $in: tagArray };
      }
    }

    // Add search filter
    if (search.trim()) {
      // Search in both text and summary fields using regex (case-insensitive)
      filter.$or = [
        { text: { $regex: search, $options: "i" } },
        { summary: { $regex: search, $options: "i" } }
      ];
    }

    // Build sort object
    let sortObj = { createdAt: -1 }; // Default: newest first
    if (sort === "oldest") {
      sortObj = { createdAt: 1 };
    } else if (sort === "alphabetical") {
      sortObj = { text: 1 };
    } else if (sort === "alphabetical-desc") {
      sortObj = { text: -1 };
    }

    // Get total count for pagination info
    const total = await Note.countDocuments(filter);

    // Fetch paginated and sorted notes with populated category
    const notes = await Note.find(filter)
      .populate('categoryId')
      .populate('lastModifiedBy', 'username email')
      .sort(sortObj)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      message: "Notes retrieved successfully",
      data: notes,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    console.error("Get Notes Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve notes",
      error: error.message
    });
  }
};

// UPDATE
export const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, categoryId, tags } = req.body;

    // Check if note exists and belongs to user
    const note = await Note.findById(id);
    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
        error: "No note with this ID"
      });
    }

    // Check if user owns the note
    if (note.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this note",
        error: "Forbidden"
      });
    }

    // Generate new summary
    const summary = await generateSummary(content);
    const wordCount = calculateWordCount(content);

    // Update note
    const updatedNote = await Note.findByIdAndUpdate(
      id,
      {
        text: content,
        summary,
        wordCount,
        lastModifiedBy: req.userId,
        ...(tags && { tags: Array.isArray(tags) ? tags.filter(tag => tag.trim()).slice(0, 5) : [] }),
        ...(categoryId !== undefined && { categoryId: categoryId || null })
      },
      { new: true }
    ).populate('categoryId').populate('lastModifiedBy', 'username email');

    // Log activity
    await logActivity(id, req.userId, 'updated');

    res.status(200).json({
      success: true,
      message: "Note updated successfully",
      data: updatedNote
    });

  } catch (error) {
    console.error("Update Note Error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "Failed to update note",
      error: error.response?.data?.error || "AI service error. Please try again."
    });
  }
};

// DELETE
export const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;

    const note = await Note.findById(id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
        error: "No note with this ID"
      });
    }

    // Check if user owns the note
    if (note.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this note",
        error: "Forbidden"
      });
    }

    await Note.findByIdAndDelete(id);

    // Log activity
    await logActivity(id, req.userId, 'deleted');

    res.status(200).json({
      success: true,
      message: "Note deleted successfully",
      data: note
    });

  } catch (error) {
    console.error("Delete Note Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to delete note",
      error: error.message
    });
  }
};

// TOGGLE FAVORITE
export const toggleFavorite = async (req, res) => {
  try {
    const { id } = req.params;

    const note = await Note.findById(id);
    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found"
      });
    }

    if (note.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to modify this note"
      });
    }

    const newFavoriteState = !note.isFavorited;
    const updatedNote = await Note.findByIdAndUpdate(
      id,
      { isFavorited: newFavoriteState },
      { new: true }
    ).populate('categoryId');

    // Log activity
    await logActivity(id, req.userId, newFavoriteState ? 'favorited' : 'unfavorited');

    res.status(200).json({
      success: true,
      message: `Note ${newFavoriteState ? 'added to' : 'removed from'} favorites`,
      data: updatedNote
    });
  } catch (error) {
    console.error("Toggle Favorite Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to toggle favorite",
      error: error.message
    });
  }
};

// TOGGLE ARCHIVE
export const toggleArchive = async (req, res) => {
  try {
    const { id } = req.params;

    const note = await Note.findById(id);
    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found"
      });
    }

    if (note.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to modify this note"
      });
    }

    const newArchiveState = !note.isArchived;
    const updatedNote = await Note.findByIdAndUpdate(
      id,
      { isArchived: newArchiveState },
      { new: true }
    ).populate('categoryId');

    // Log activity
    await logActivity(id, req.userId, newArchiveState ? 'archived' : 'unarchived');

    res.status(200).json({
      success: true,
      message: `Note ${newArchiveState ? 'archived' : 'unarchived'}`,
      data: updatedNote
    });
  } catch (error) {
    console.error("Toggle Archive Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to toggle archive",
      error: error.message
    });
  }
};

// DUPLICATE NOTE
export const duplicateNote = async (req, res) => {
  try {
    const { id } = req.params;

    const note = await Note.findById(id);
    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found"
      });
    }

    if (note.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to duplicate this note"
      });
    }

    // Create duplicate note (reset favorites and archive)
    const duplicatedNote = new Note({
      text: note.text,
      content: note.content,
      contentType: note.contentType,
      summary: note.summary,
      userId: req.userId,
      categoryId: note.categoryId,
      tags: [...note.tags],
      wordCount: note.wordCount,
      isFavorited: false,
      isArchived: false
    });

    await duplicatedNote.save();
    await duplicatedNote.populate('categoryId');

    // Log activity
    await logActivity(duplicatedNote._id, req.userId, 'created');

    res.status(201).json({
      success: true,
      message: "Note duplicated successfully",
      data: duplicatedNote
    });
  } catch (error) {
    console.error("Duplicate Note Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to duplicate note",
      error: error.message
    });
  }
};

// GET ACTIVITY LOG
export const getActivityLog = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 20 } = req.query;

    const note = await Note.findById(id);
    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found"
      });
    }

    if (note.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this note's activity"
      });
    }

    const activities = await ActivityLog.find({ noteId: id })
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .limit(Math.min(parseInt(limit) || 20, 100));

    res.status(200).json({
      success: true,
      message: "Activity log retrieved successfully",
      data: activities
    });
  } catch (error) {
    console.error("Get Activity Log Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve activity log",
      error: error.message
    });
  }
};

// BULK DELETE
export const bulkDelete = async (req, res) => {
  try {
    const { noteIds = [] } = req.body;

    if (!Array.isArray(noteIds) || noteIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of note IDs"
      });
    }

    // Verify all notes belong to user
    const notes = await Note.find({ _id: { $in: noteIds }, userId: req.userId });
    
    if (notes.length !== noteIds.length) {
      return res.status(403).json({
        success: false,
        message: "Some notes do not belong to you or do not exist"
      });
    }

    // Delete notes
    const result = await Note.deleteMany({ _id: { $in: noteIds }, userId: req.userId });

    // Log activities
    for (const noteId of noteIds) {
      await logActivity(noteId, req.userId, 'deleted');
    }

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} notes deleted successfully`,
      data: { deletedCount: result.deletedCount }
    });
  } catch (error) {
    console.error("Bulk Delete Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to delete notes",
      error: error.message
    });
  }
};

// BULK ARCHIVE/UNARCHIVE
export const bulkArchive = async (req, res) => {
  try {
    const { noteIds = [], isArchived } = req.body;

    if (!Array.isArray(noteIds) || noteIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of note IDs"
      });
    }

    if (typeof isArchived !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: "isArchived must be a boolean"
      });
    }

    // Verify all notes belong to user
    const notes = await Note.find({ _id: { $in: noteIds }, userId: req.userId });
    
    if (notes.length !== noteIds.length) {
      return res.status(403).json({
        success: false,
        message: "Some notes do not belong to you or do not exist"
      });
    }

    // Update notes
    const result = await Note.updateMany(
      { _id: { $in: noteIds }, userId: req.userId },
      { isArchived }
    );

    // Log activities
    for (const noteId of noteIds) {
      await logActivity(noteId, req.userId, isArchived ? 'archived' : 'unarchived');
    }

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} notes ${isArchived ? 'archived' : 'unarchived'} successfully`,
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    console.error("Bulk Archive Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to update notes",
      error: error.message
    });
  }
};