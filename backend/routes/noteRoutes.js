import express from "express";
import {
  createNote,
  getNotes,
  updateNote,
  deleteNote,
  toggleFavorite,
  toggleArchive,
  duplicateNote,
  getActivityLog,
  bulkDelete,
  bulkArchive
} from "../controllers/noteController.js";
import { validateNote } from "../middleware/validation.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All note routes are protected
router.post("/", protect, validateNote, createNote);
router.get("/", protect, getNotes);
router.put("/:id", protect, validateNote, updateNote);
router.delete("/:id", protect, deleteNote);

// Toggle favorite
router.put("/:id/favorite", protect, toggleFavorite);

// Toggle archive
router.put("/:id/archive", protect, toggleArchive);

// Duplicate note
router.post("/:id/duplicate", protect, duplicateNote);

// Get activity log
router.get("/:id/activity", protect, getActivityLog);

// Bulk operations
router.delete("/", protect, bulkDelete);
router.put("/", protect, bulkArchive);

export default router;