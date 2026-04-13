import ActivityLog from '../models/ActivityLog.js';

export const logActivity = async (noteId, userId, action, changeDetails = null) => {
  try {
    await ActivityLog.create({
      noteId,
      userId,
      action,
      changeDetails
    });
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw - logging shouldn't break the main operation
  }
};
