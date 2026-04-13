// Validation middleware for note content
export const validateNote = (req, res, next) => {
  const { content } = req.body;

  // Check if content exists
  if (!content) {
    return res.status(400).json({
      success: false,
      message: "Content is required",
      error: "Content field is empty"
    });
  }

  // Check if content is only whitespace
  if (!content.trim()) {
    return res.status(400).json({
      success: false,
      message: "Content cannot be empty or whitespace only",
      error: "Content is empty"
    });
  }

  // Check minimum length (5 characters)
  if (content.trim().length < 5) {
    return res.status(400).json({
      success: false,
      message: "Content must be at least 5 characters long",
      error: "Content too short"
    });
  }

  // Check maximum length (5000 characters)
  if (content.trim().length > 5000) {
    return res.status(400).json({
      success: false,
      message: "Content cannot exceed 5000 characters",
      error: "Content too long"
    });
  }

  // All validations passed, move to next middleware
  next();
};
