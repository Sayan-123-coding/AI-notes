import Note from "../models/Note.js";
import Category from "../models/Category.js";

// Helper to build filter
const buildFilter = (userId, query) => {
  let filter = { userId, isArchived: false };

  if (query.categoryId) {
    filter.categoryId = query.categoryId;
  }

  if (query.tags) {
    const tagArray = query.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    if (tagArray.length > 0) {
      filter.tags = { $in: tagArray };
    }
  }

  if (query.isFavorited === "true") {
    filter.isFavorited = true;
  }

  return filter;
};

// EXPORT AS JSON
export const exportAsJSON = async (req, res) => {
  try {
    const filter = buildFilter(req.userId, req.query);

    const notes = await Note.find(filter)
      .populate('categoryId')
      .populate('userId', 'username email')
      .sort({ createdAt: -1 });

    const exportData = {
      exportDate: new Date().toISOString(),
      userEmail: req.user.email,
      totalNotes: notes.length,
      notes: notes.map(note => ({
        id: note._id,
        content: note.text,
        summary: note.summary,
        category: note.categoryId ? {
          id: note.categoryId._id,
          name: note.categoryId.name,
          icon: note.categoryId.icon,
          color: note.categoryId.color
        } : null,
        tags: note.tags,
        wordCount: note.wordCount,
        isFavorited: note.isFavorited,
        isArchived: note.isArchived,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
      }))
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="notes-export.json"');
    res.json(exportData);
  } catch (error) {
    console.error("Export JSON Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to export notes as JSON",
      error: error.message
    });
  }
};

// EXPORT AS CSV
export const exportAsCSV = async (req, res) => {
  try {
    const filter = buildFilter(req.userId, req.query);

    const notes = await Note.find(filter)
      .populate('categoryId')
      .sort({ createdAt: -1 });

    // Build CSV content
    const headers = ['Created', 'Title (First 50 chars)', 'Content', 'Summary', 'Category', 'Tags', 'Word Count', 'Favorite', 'Status'];
    const rows = notes.map(note => [
      new Date(note.createdAt).toLocaleDateString(),
      note.text.substring(0, 50).replace(/"/g, '""'),
      `"${note.text.replace(/"/g, '""')}"`,
      `"${(note.summary || '').replace(/"/g, '""')}"`,
      note.categoryId?.name || 'None',
      note.tags.join('; '),
      note.wordCount,
      note.isFavorited ? 'Yes' : 'No',
      note.isArchived ? 'Archived' : 'Active'
    ]);

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.map((cell, idx) => {
        // Quote fields if they contain commas or newlines
        if (idx === 2 || idx === 3) return cell;
        return typeof cell === 'string' && (cell.includes(',') || cell.includes('\n')) 
          ? `"${cell.replace(/"/g, '""')}"` 
          : cell;
      }).join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="notes-export.csv"');
    res.send(csvContent);
  } catch (error) {
    console.error("Export CSV Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to export notes as CSV",
      error: error.message
    });
  }
};

// EXPORT AS MARKDOWN
export const exportAsMarkdown = async (req, res) => {
  try {
    const filter = buildFilter(req.userId, req.query);

    const notes = await Note.find(filter)
      .populate('categoryId')
      .sort({ createdAt: -1 });

    const categories = await Category.find({ userId: req.userId });
    const categoryMap = categories.reduce((acc, cat) => {
      acc[cat._id] = cat;
      return acc;
    }, {});

    // Build markdown content
    let mdContent = '# My Notes Export\n\n';
    mdContent += `**Export Date:** ${new Date().toLocaleDateString()}\n`;
    mdContent += `**Total Notes:** ${notes.length}\n\n`;
    mdContent += '---\n\n';

    notes.forEach((note, index) => {
      mdContent += `## ${index + 1}. ${note.text.substring(0, 40).replace(/\n/g, ' ').trim()}...\n\n`;
      
      mdContent += `**Created:** ${new Date(note.createdAt).toLocaleDateString()}\n`;
      mdContent += `**Last Updated:** ${new Date(note.updatedAt).toLocaleDateString()}\n`;
      mdContent += `**Word Count:** ${note.wordCount} words\n`;
      
      if (note.categoryId) {
        mdContent += `**Category:** ${note.categoryId.icon} ${note.categoryId.name}\n`;
      }
      
      if (note.tags.length > 0) {
        mdContent += `**Tags:** ${note.tags.map(t => `#${t}`).join(', ')}\n`;
      }
      
      mdContent += `**Status:** ${note.isFavorited ? '⭐ Favorite' : ''} ${note.isArchived ? '📦 Archived' : ''}\n\n`;
      
      mdContent += `### Content\n${note.text}\n\n`;
      
      if (note.summary) {
        mdContent += `### AI Summary\n${note.summary}\n\n`;
      }
      
      mdContent += '---\n\n';
    });

    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', 'attachment; filename="notes-export.md"');
    res.send(mdContent);
  } catch (error) {
    console.error("Export Markdown Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to export notes as Markdown",
      error: error.message
    });
  }
};
