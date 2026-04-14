import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { jsPDF } from "jspdf";
import {
  Share2,
  Archive,
  Tag,
  Plus,
  Download,
  FolderPlus,
  Moon,
  Sun,
  Keyboard,
  Settings,
  LogOut,
  FileText,
  Edit,
  Trash2,
  Search,
  Star,
  BarChart3,
  Lightbulb,
  Eye,
  Copy,
  RefreshCw,
  CheckCircle2,
  Clock,
  MessageSquare,
} from "lucide-react";
import SkeletonLoader from "../components/SkeletonLoader";
import KeyboardShortcutsHelp from "../components/KeyboardShortcutsHelp";
import RichTextEditor from "../components/RichTextEditor";
import ExportModal from "../components/ExportModal";
import BulkActionsBar from "../components/BulkActionsBar";
import TagManager from "../components/TagManager";
import NotePreviewModal from "../components/NotePreviewModal";
import NoteTemplatesModal from "../components/NoteTemplatesModal";

// API Configuration
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Home = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Notes and core state
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const debounceTimer = useRef(null);

  // UI State
  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem("darkMode") === "true",
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Categories
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#45B7D1");
  const [newCategoryIcon, setNewCategoryIcon] = useState("📝");

  // Tags
  const [tags, setTags] = useState([]);
  const [showTagManager, setShowTagManager] = useState(false);

  // Share Feature
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareNoteId, setShareNoteId] = useState(null);
  const [shareEmail, setShareEmail] = useState("");
  const [noteShares, setNoteShares] = useState([]);

  // Settings/Password
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Search, Sort, and Pagination
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("date");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [searchHistory, setSearchHistory] = useState(() =>
    JSON.parse(localStorage.getItem("searchHistory") || "[]"),
  );
  const [showSearchHistory, setShowSearchHistory] = useState(false);

  // Filters
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showArchivedOnly, setShowArchivedOnly] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);

  // Preview and export modals
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewNote, setPreviewNote] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);

  // Bulk select and rich text
  const [isBulkSelectMode, setIsBulkSelectMode] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState(new Set());
  const [useRichTextEditor, setUseRichTextEditor] = useState(false);
  const [richTextContent, setRichTextContent] = useState({
    html: "",
    text: "",
  });

  // Keyboard help
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully", { duration: 2000 });
    setTimeout(() => {
      navigate("/login");
    }, 600);
  };

  // 🔥 Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+N: New note (focus textarea)
      if (e.ctrlKey && e.key === "n") {
        e.preventDefault();
        document
          .querySelector('textarea[placeholder*="share your thoughts"]')
          ?.focus();
      }
      // Ctrl+K: Search
      else if (e.ctrlKey && e.key === "k") {
        e.preventDefault();
        document.querySelector('input[placeholder*="Search"]')?.focus();
      }
      // Ctrl+E: Edit first note
      else if (e.ctrlKey && e.key === "e") {
        e.preventDefault();
        if (notes.length > 0) startEdit(notes[0]);
      }
      // Ctrl+Shift+D: Toggle dark mode
      else if (e.ctrlKey && e.shiftKey && e.key === "D") {
        e.preventDefault();
        setIsDarkMode(!isDarkMode);
      }
      // ?: Show help
      else if (e.key === "?") {
        e.preventDefault();
        setShowKeyboardHelp(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [notes, isDarkMode]);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem("darkMode", isDarkMode);
  }, [isDarkMode]);

  // 🔥 FETCH CATEGORIES
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // 🔥 FETCH TAGS
  const fetchTags = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_URL}/tags`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setTags(data.data);
      }
    } catch (err) {
      console.error("Error fetching tags:", err);
    }
  };

  // 🔥 FETCH FROM DB with filters
  const fetchNotes = async (
    searchQuery = "",
    sortBy = "date",
    pageNum = 1,
    categoryId = "",
    isFavorited = false,
    tagsToFilter = [],
  ) => {
    setIsFetching(true);
    try {
      const params = new URLSearchParams({
        search: searchQuery,
        sort: sortBy,
        page: pageNum,
        limit: 10,
        isArchived: showArchivedOnly ? "true" : "false",
      });

      if (categoryId) {
        params.append("categoryId", categoryId);
      }

      if (isFavorited) {
        params.append("isFavorited", "true");
      }

      if (tagsToFilter && tagsToFilter.length > 0) {
        params.append("tags", tagsToFilter.join(","));
      }

      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_URL}/notes?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        setNotes(data.data);
        setPagination(data.pagination);
      } else {
        toast.error("Failed to load notes");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load notes");
    } finally {
      setIsFetching(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchCategories();
    fetchTags();
    fetchNotes("", "date", 1, "", false, []);
  }, []);

  // Debounced search handler
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearch(query);
    setPage(1);

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer
    debounceTimer.current = setTimeout(() => {
      // Save to search history if not empty
      if (query.trim()) {
        const updated = [
          query,
          ...searchHistory.filter((h) => h !== query),
        ].slice(0, 10);
        setSearchHistory(updated);
        localStorage.setItem("searchHistory", JSON.stringify(updated));
      }
      fetchNotes(query, sort, 1, selectedCategory);
    }, 300);
  };

  // Handle search history selection
  const handleSearchHistorySelect = (historyQuery) => {
    setSearch(historyQuery);
    setPage(1);
    setShowSearchHistory(false);
    fetchNotes(historyQuery, sort, 1, selectedCategory);
  };

  // Clear search history
  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.setItem("searchHistory", JSON.stringify([]));
    toast.success("Search history cleared");
  };

  // Sort handler
  const handleSort = (newSort) => {
    setSort(newSort);
    setPage(1);
    fetchNotes(search, newSort, 1, selectedCategory);
  };

  // Category filter handler
  const handleCategoryFilter = (categoryId) => {
    setSelectedCategory(categoryId);
    setPage(1);
    fetchNotes(search, sort, 1, categoryId);
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (pagination?.hasNextPage) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNotes(search, sort, nextPage, selectedCategory);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevPage = () => {
    if (pagination?.hasPrevPage) {
      const prevPage = page - 1;
      setPage(prevPage);
      fetchNotes(search, sort, prevPage, selectedCategory);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Validation function
  const validateContent = (content) => {
    if (!content.trim()) {
      toast.error("Content cannot be empty");
      return false;
    }
    if (content.trim().length < 5) {
      toast.error("Content must be at least 5 characters long");
      return false;
    }
    if (content.trim().length > 5000) {
      toast.error("Content cannot exceed 5000 characters");
      return false;
    }
    return true;
  };

  // Handle template selection
  const handleSelectTemplate = (templateContent) => {
    setNote(templateContent);
    toast.success("Template applied! Customize it for your needs");
  };

  // 🔥 ADD NOTE (AI + DB)
  const handleSubmit = async () => {
    if (!validateContent(note)) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_URL}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: note,
          ...(selectedCategory && { categoryId: selectedCategory }),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to create note");
        return;
      }

      setNotes((prev) => [data.data, ...prev]);
      setNote("");
      setPage(1);
      setSearch("");
      setSort("date");
      toast.success("Note created successfully! ✨");
    } catch (err) {
      console.error(err);
      toast.error("Error creating note");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 START EDIT
  const startEdit = (noteItem) => {
    setEditingId(noteItem._id);
    setEditContent(noteItem.text);
    setEditingCategory(noteItem.categoryId?._id || "");
  };

  // 🔥 CANCEL EDIT
  const cancelEdit = () => {
    setEditingId(null);
    setEditContent("");
    setEditingCategory("");
  };

  // 🔥 UPDATE NOTE
  const handleUpdate = async () => {
    if (!validateContent(editContent)) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_URL}/notes/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: editContent,
          ...(editingCategory !== undefined && {
            categoryId: editingCategory || null,
          }),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to update note");
        return;
      }

      setNotes((prev) =>
        prev.map((n) => (n._id === editingId ? data.data : n)),
      );
      setEditingId(null);
      setEditContent("");
      setEditingCategory("");
      toast.success("Note updated successfully! ✨");
    } catch (err) {
      console.error(err);
      toast.error("Error updating note");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 TOGGLE FAVORITE
  const toggleFavorite = async (id) => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_URL}/notes/${id}/favorite`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setNotes((prev) => prev.map((n) => (n._id === id ? data.data : n)));
        toast.success(
          data.data.isFavorited
            ? "Added to favorites! ⭐"
            : "Removed from favorites",
        );
      } else {
        toast.error(data.message || "Failed to toggle favorite");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error toggling favorite");
    }
  };

  // 🔥 TOGGLE ARCHIVE
  const toggleArchive = async (id) => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_URL}/notes/${id}/archive`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setNotes((prev) => prev.map((n) => (n._id === id ? data.data : n)));
        toast.success(
          data.data.isArchived ? "Note archived! 📦" : "Note unarchived",
        );
      } else {
        toast.error(data.message || "Failed to toggle archive");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error toggling archive");
    }
  };

  // 🔥 DUPLICATE NOTE
  const duplicateNote = async (id) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_URL}/notes/${id}/duplicate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setNotes((prev) => [data.data, ...prev]);
        toast.success("Note duplicated successfully! 🔄");
      } else {
        toast.error(data.message || "Failed to duplicate note");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error duplicating note");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 BULK DELETE
  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedNotes.size} notes?`)) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_URL}/notes`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ noteIds: Array.from(selectedNotes) }),
      });
      const data = await res.json();
      if (data.success) {
        setNotes((prev) => prev.filter((n) => !selectedNotes.has(n._id)));
        setSelectedNotes(new Set());
        setIsBulkSelectMode(false);
        toast.success(`${data.data.deletedCount} notes deleted! 🗑️`);
      } else {
        toast.error(data.message || "Failed to delete notes");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting notes");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 BULK ARCHIVE
  const handleBulkArchive = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_URL}/notes`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          noteIds: Array.from(selectedNotes),
          isArchived: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNotes((prev) => prev.filter((n) => !selectedNotes.has(n._id)));
        setSelectedNotes(new Set());
        toast.success(`${data.data.modifiedCount} notes archived! 📦`);
      } else {
        toast.error(data.message || "Failed to archive notes");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error archiving notes");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 BULK FAVORITE
  const handleBulkFavorite = async () => {
    // For simplicity, favorite each note individually
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      for (const noteId of selectedNotes) {
        await fetch(`${API_URL}/notes/${noteId}/favorite`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      // Refresh notes
      await fetchNotes(
        search,
        sort,
        page,
        selectedCategory,
        showFavoritesOnly,
        selectedTags,
      );
      setSelectedNotes(new Set());
      toast.success("Notes favorited! ⭐");
    } catch (err) {
      console.error(err);
      toast.error("Error favoriting notes");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 DELETE
  const deleteNote = async (id) => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_URL}/notes/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to delete note");
        return;
      }

      setNotes((prev) => prev.filter((n) => n._id !== id));
      toast.success("Note deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Error deleting note");
    }
  };

  // 🔥 EXPORT NOTE TO PDF
  const exportNoteToPDF = async (noteId) => {
    try {
      setLoading(true);
      const note = notes.find((n) => n._id === noteId);
      if (!note) {
        toast.error("Note not found");
        return;
      }

      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const textWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      // Title
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      const titleLines = pdf.splitTextToSize(
        note.text.substring(0, 50) + "...",
        textWidth,
      );
      pdf.text(titleLines, margin, yPosition);
      yPosition += titleLines.length * 8 + 10;

      // Metadata
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "regular");
      const metadataText = `
Created: ${new Date(note.createdAt).toLocaleDateString()}
Updated: ${new Date(note.updatedAt).toLocaleDateString()}
Words: ${note.wordCount || 0}
Category: ${note.categoryId?.name || "No Category"}
      `.trim();
      pdf.text(metadataText, margin, yPosition);
      yPosition += 35;

      // Summary Section
      if (note.summary) {
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text("📋 AI Summary", margin, yPosition);
        yPosition += 8;

        pdf.setFontSize(10);
        pdf.setFont("helvetica", "regular");
        const summaryLines = pdf.splitTextToSize(note.summary, textWidth);
        pdf.text(summaryLines, margin, yPosition);
        yPosition += summaryLines.length * 5 + 10;
      }

      // Divider
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Full Content
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("📝 Full Content", margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "regular");
      const contentLines = pdf.splitTextToSize(note.text, textWidth);

      // Add content with page breaks if needed
      for (let i = 0; i < contentLines.length; i++) {
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(contentLines[i], margin, yPosition);
        yPosition += 5;
      }

      // File name
      const fileName = `Note-${new Date().toISOString().split("T")[0]}.pdf`;
      pdf.save(fileName);

      toast.success("Note exported as PDF! 📥");
    } catch (error) {
      console.error("Error exporting note:", error);
      toast.error("Failed to export note as PDF");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 SHARE NOTE FUNCTIONS
  const openShareModal = async (noteId) => {
    setShareNoteId(noteId);
    setShareEmail("");

    // Fetch current shares for this note
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_URL}/shares/note/${noteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setNoteShares(data.data);
      }
    } catch (err) {
      console.error("Error fetching shares:", err);
    }

    setShowShareModal(true);
  };

  const handleShare = async () => {
    if (!shareEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_URL}/shares`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          noteId: shareNoteId,
          email: shareEmail,
          permission: "view",
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(`Note shared with ${shareEmail}! 🎉`);
        setShareEmail("");
        // Refresh shares list
        const sharesRes = await fetch(`${API_URL}/shares/note/${shareNoteId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const sharesData = await sharesRes.json();
        if (sharesData.success) {
          setNoteShares(sharesData.data);
        }
      } else {
        toast.error(data.message || "Failed to share note");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error sharing note");
    } finally {
      setLoading(false);
    }
  };

  const revokeShare = async (shareId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_URL}/shares/${shareId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Share revoked!");
        setNoteShares((prev) => prev.filter((s) => s._id !== shareId));
      } else {
        toast.error(data.message || "Failed to revoke share");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error revoking share");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 SETTINGS/PASSWORD UPDATE
  const handleUpdatePassword = async () => {
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_URL}/auth/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword,
          newPassword,
          confirmPassword: confirmNewPassword,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Password updated successfully!");
        setOldPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        setShowSettingsModal(false);
      } else {
        toast.error(data.message || "Failed to update password");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen relative overflow-hidden transition-colors duration-500 ${
        isDarkMode
          ? "bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950"
          : "bg-gradient-to-br from-gray-50 via-white to-gray-50"
      }`}
    >
      <Toaster position="top-right" />

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <div className="flex min-h-screen">
        {/* LEFT SIDEBAR - FIXED ON MOBILE, RELATIVE ON DESKTOP */}
        <div
          className={`fixed md:relative inset-y-0 left-0 w-72 z-50 transform transition-transform duration-300 md:transform-none ${
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }`}
        >
          <div
            className={`w-72 h-full backdrop-blur border-r overflow-y-auto transition-colors duration-500 ${
              isDarkMode
                ? "bg-slate-900/80 border-white/10"
                : "bg-white border-gray-200"
            }`}
          >
            {/* User Profile Section */}
            <div
              className={`p-6 border-b transition-colors duration-500 ${
                isDarkMode ? "border-white/10" : "border-gray-200"
              }`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-500/30 flex-shrink-0">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p
                    className={`font-bold truncate transition-colors duration-500 ${
                      isDarkMode ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {user?.username}
                  </p>
                  <p
                    className={`text-xs truncate transition-colors duration-500 ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {user?.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate("/profile")}
                className={`w-full px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3 text-sm font-semibold ${
                  isDarkMode
                    ? "bg-blue-500/20 hover:bg-blue-500/40 border border-blue-400/40 text-blue-300 hover:text-blue-200"
                    : "bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 hover:text-blue-800"
                }`}
                title="View your profile"
              >
                👤 <span>My Profile</span>
              </button>
            </div>

            {/* Navigation Menu */}
            <div
              className={`p-4 space-y-2 border-b transition-colors duration-500 ${
                isDarkMode ? "border-white/10" : "border-gray-200"
              }`}
            >
              <button
                onClick={() => navigate("/shared")}
                className={`w-full px-4 py-3 font-semibold rounded-lg transition-all duration-200 flex items-center gap-3 text-sm border ${
                  isDarkMode
                    ? "bg-purple-500/20 hover:bg-purple-500/40 border-purple-400/40 text-purple-300 hover:text-purple-200"
                    : "bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700 hover:text-purple-800"
                }`}
                title="View notes shared with you"
              >
                <Share2 size={20} />
                <span>Shared Notes</span>
              </button>
              <button
                onClick={() => navigate("/archived")}
                className={`w-full px-4 py-3 font-semibold rounded-lg transition-all duration-200 flex items-center gap-3 text-sm border ${
                  isDarkMode
                    ? "bg-orange-500/20 hover:bg-orange-500/40 border-orange-400/40 text-orange-300 hover:text-orange-200"
                    : "bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700 hover:text-orange-800"
                }`}
                title="View archived notes"
              >
                <Archive size={20} />
                <span>Archived</span>
              </button>
              <button
                onClick={() => navigate("/tags")}
                className={`w-full px-4 py-3 font-semibold rounded-lg transition-all duration-200 flex items-center gap-3 text-sm border ${
                  isDarkMode
                    ? "bg-green-500/20 hover:bg-green-500/40 border-green-400/40 text-green-300 hover:text-green-200"
                    : "bg-green-50 hover:bg-green-100 border-green-200 text-green-700 hover:text-green-800"
                }`}
                title="Manage all tags"
              >
                <Tag size={20} />
                <span>Tags</span>
              </button>
            </div>

            {/* Quick Actions */}
            <div
              className={`p-4 space-y-2 border-b transition-colors duration-500 ${
                isDarkMode ? "border-white/10" : "border-gray-200"
              }`}
            >
              <p
                className={`text-xs font-bold uppercase tracking-wider px-2 mb-3 transition-colors duration-500 ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Quick Actions
              </p>
              <button
                onClick={() => setShowTagManager(true)}
                className={`w-full px-4 py-3 font-semibold rounded-lg transition-all duration-200 flex items-center gap-3 text-sm border ${
                  isDarkMode
                    ? "bg-cyan-500/20 hover:bg-cyan-500/40 border-cyan-400/40 text-cyan-300 hover:text-cyan-200"
                    : "bg-cyan-50 hover:bg-cyan-100 border-cyan-200 text-cyan-700 hover:text-cyan-800"
                }`}
                title="Create new tag"
              >
                <Plus size={20} />
                <span>New Tag</span>
              </button>

              <button
                onClick={() => setShowCategoryModal(true)}
                className={`w-full px-4 py-3 font-semibold rounded-lg transition-all duration-200 flex items-center gap-3 text-sm border ${
                  isDarkMode
                    ? "bg-pink-500/20 hover:bg-pink-500/40 border-pink-400/40 text-pink-300 hover:text-pink-200"
                    : "bg-pink-50 hover:bg-pink-100 border-pink-200 text-pink-700 hover:text-pink-800"
                }`}
                title="Create new category"
              >
                <FolderPlus size={20} />
                <span>New Category</span>
              </button>
            </div>

            {/* Stats */}
            {notes.length > 0 && (
              <div
                className={`p-4 border-b transition-colors duration-500 ${
                  isDarkMode ? "border-white/10" : "border-gray-200"
                }`}
              >
                <p
                  className={`text-xs font-bold uppercase tracking-wider px-2 mb-3 flex items-center gap-2 transition-colors duration-500 ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  <BarChart3 size={14} /> Stats
                </p>
                <div className="space-y-2">
                  <div
                    className={`flex items-center justify-between p-2 rounded border transition-colors duration-500 ${
                      isDarkMode
                        ? "bg-white/5 border-white/10"
                        : "bg-gray-100 border-gray-200"
                    }`}
                  >
                    <span
                      className={`text-xs transition-colors duration-500 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Total
                    </span>
                    <span
                      className={`font-bold transition-colors duration-500 ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    >
                      {pagination?.total || notes.length}
                    </span>
                  </div>
                  <div
                    className={`flex items-center justify-between p-2 rounded border transition-colors duration-500 ${
                      isDarkMode
                        ? "bg-white/5 border-white/10"
                        : "bg-yellow-50 border-yellow-200"
                    }`}
                  >
                    <span
                      className={`text-xs flex items-center gap-1 transition-colors duration-500 ${isDarkMode ? "text-yellow-300" : "text-yellow-700"}`}
                    >
                      <Star size={12} /> Favorites
                    </span>
                    <span
                      className={`font-bold transition-colors duration-500 ${isDarkMode ? "text-yellow-200" : "text-yellow-700"}`}
                    >
                      {notes.filter((n) => n.isFavorited).length}
                    </span>
                  </div>
                  <div
                    className={`flex items-center justify-between p-2 rounded border transition-colors duration-500 ${
                      isDarkMode
                        ? "bg-white/5 border-white/10"
                        : "bg-orange-50 border-orange-200"
                    }`}
                  >
                    <span
                      className={`text-xs flex items-center gap-1 transition-colors duration-500 ${isDarkMode ? "text-orange-300" : "text-orange-700"}`}
                    >
                      <Archive size={12} /> Archived
                    </span>
                    <span
                      className={`font-bold transition-colors duration-500 ${isDarkMode ? "text-orange-200" : "text-orange-700"}`}
                    >
                      {notes.filter((n) => n.isArchived).length}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Tags List */}
            {tags.length > 0 && (
              <div
                className={`p-4 border-b transition-colors duration-500 ${
                  isDarkMode ? "border-white/10" : "border-gray-200"
                }`}
              >
                <p
                  className={`text-xs font-bold uppercase tracking-wider px-2 mb-3 flex items-center gap-2 transition-colors duration-500 ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  <Tag size={14} /> Your Tags
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {tags.slice(0, 8).map((tag) => (
                    <button
                      key={tag._id}
                      onClick={() => setSelectedTags([tag._id])}
                      className="text-xs px-2.5 py-1 rounded-full border transition-all hover:shadow-md"
                      style={{
                        backgroundColor: isDarkMode
                          ? `${tag.color}20`
                          : `${tag.color}15`,
                        borderColor: isDarkMode
                          ? `${tag.color}40`
                          : `${tag.color}30`,
                        color: isDarkMode ? tag.color : tag.color,
                      }}
                      title={`Filter by ${tag.name}`}
                    >
                      {tag.icon} {tag.name}
                    </button>
                  ))}
                  {tags.length > 8 && (
                    <button
                      onClick={() => navigate("/tags")}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                        isDarkMode
                          ? "bg-white/10 border-white/20 text-gray-300 hover:text-white"
                          : "bg-gray-100 border-gray-300 text-gray-700 hover:text-gray-900"
                      }`}
                    >
                      +{tags.length - 8}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Pro Tips */}
            <div
              className={`p-4 border-b m-4 rounded-lg transition-colors duration-500 ${
                isDarkMode
                  ? "border-white/10 bg-blue-500/10"
                  : "border-blue-200 bg-blue-50"
              }`}
            >
              <p
                className={`text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2 transition-colors duration-500 ${
                  isDarkMode ? "text-blue-300" : "text-blue-700"
                }`}
              >
                <Lightbulb size={14} /> Pro Tips
              </p>
              <div
                className={`space-y-1.5 text-xs transition-colors duration-500 ${
                  isDarkMode ? "text-blue-200/80" : "text-blue-700"
                }`}
              >
                <div className="flex gap-2">
                  <kbd
                    className={`px-1.5 py-0.5 rounded border font-mono text-xs transition-colors duration-500 ${
                      isDarkMode
                        ? "bg-blue-500/30 border-blue-400/50"
                        : "bg-blue-100 border-blue-300"
                    }`}
                  >
                    Ctrl+N
                  </kbd>
                  <span>New Note</span>
                </div>
                <div className="flex gap-2">
                  <kbd
                    className={`px-1.5 py-0.5 rounded border font-mono text-xs transition-colors duration-500 ${
                      isDarkMode
                        ? "bg-blue-500/30 border-blue-400/50"
                        : "bg-blue-100 border-blue-300"
                    }`}
                  >
                    Ctrl+K
                  </kbd>
                  <span>Search</span>
                </div>
                <div className="flex gap-2">
                  <kbd
                    className={`px-1.5 py-0.5 rounded border font-mono text-xs transition-colors duration-500 ${
                      isDarkMode
                        ? "bg-blue-500/30 border-blue-400/50"
                        : "bg-blue-100 border-blue-300"
                    }`}
                  >
                    ?
                  </kbd>
                  <span>Help</span>
                </div>
              </div>
            </div>

            {/* Settings Section */}
            <div
              className={`p-4 mt-auto border-t transition-colors duration-500 space-y-2 ${
                isDarkMode ? "border-white/10" : "border-gray-200"
              }`}
            >
              {/* Dark mode button removed - moved to top-right corner */}
              <button
                onClick={() => setShowKeyboardHelp(true)}
                className={`w-full px-4 py-2 font-semibold rounded-lg transition-all text-sm flex items-center gap-3 border ${
                  isDarkMode
                    ? "bg-pink-500/20 hover:bg-pink-500/40 border-pink-400/40 text-pink-300 hover:text-pink-200"
                    : "bg-pink-100 hover:bg-pink-200 border-pink-200 text-pink-700 hover:text-pink-800"
                }`}
                title="Show keyboard shortcuts"
              >
                <Keyboard size={18} />
                <span>Shortcuts</span>
              </button>
              <button
                onClick={() => setShowSettingsModal(true)}
                className={`w-full px-4 py-2 font-semibold rounded-lg transition-all text-sm flex items-center gap-3 border ${
                  isDarkMode
                    ? "bg-blue-500/20 hover:bg-blue-500/40 border-blue-400/40 text-blue-300 hover:text-blue-200"
                    : "bg-blue-100 hover:bg-blue-200 border-blue-200 text-blue-700 hover:text-blue-800"
                }`}
                title="Account settings"
              >
                <Settings size={18} />
                <span>Settings</span>
              </button>
              <button
                onClick={handleLogout}
                className={`w-full px-4 py-2 font-semibold rounded-lg transition-all text-sm flex items-center gap-3 border ${
                  isDarkMode
                    ? "bg-red-500/20 hover:bg-red-500/40 border-red-400/40 text-red-300 hover:text-red-200"
                    : "bg-red-100 hover:bg-red-200 border-red-200 text-red-700 hover:text-red-800"
                }`}
                title="Logout"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div
        className={`flex-1 w-full md:flex-1 overflow-y-auto transition-colors duration-500 relative ${
          isDarkMode ? "" : ""
        }`}
      >
        <div className="w-full px-4 py-8 sm:px-6 lg:px-12">
          {/* Mobile Hamburger Menu - Top Left */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`fixed top-6 left-6 z-50 md:hidden w-12 h-12 rounded-full transition-all duration-300 flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 ${
              isDarkMode
                ? "bg-blue-500/20 hover:bg-blue-500/40 border border-blue-400/40 text-blue-300 hover:text-blue-200"
                : "bg-blue-500/20 hover:bg-blue-500/40 border border-blue-400/40 text-blue-700 hover:text-blue-600"
            }`}
            title="Toggle Sidebar"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Dark Mode Button - Top Right Corner */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`fixed top-6 right-6 z-40 w-14 h-14 rounded-full transition-all duration-300 flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 ${
              isDarkMode
                ? "bg-yellow-500/20 hover:bg-yellow-500/40 border border-yellow-400/40 text-yellow-300 hover:text-yellow-200 hover:shadow-yellow-500/30"
                : "bg-blue-500/20 hover:bg-blue-500/40 border border-blue-400/40 text-blue-700 hover:text-blue-600 hover:shadow-blue-500/30"
            }`}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
          {/* Animated gradient blobs */}
          <div
            className={`absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl animate-pulse ${
              isDarkMode ? "bg-blue-500/30" : "bg-blue-400/20"
            }`}
          ></div>
          <div
            className={`absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl animate-pulse delay-700 ${
              isDarkMode ? "bg-purple-500/25" : "bg-purple-400/15"
            }`}
          ></div>
          <div
            className={`absolute top-1/4 -right-20 w-72 h-72 rounded-full blur-3xl animate-pulse delay-300 ${
              isDarkMode ? "bg-cyan-500/15" : "bg-cyan-400/10"
            }`}
          ></div>

          {/* Content wrapper with max-width */}
          <div className="relative z-10 max-w-4xl mx-auto">
            {/* Edit Modal - Premium Overlay */}
            {editingId && (
              <div
                className={`fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-colors duration-500 ${
                  isDarkMode ? "bg-black/60" : "bg-black/30"
                }`}
              >
                <div
                  className={`rounded-3xl p-8 max-w-2xl w-full shadow-2xl border transition-colors duration-500 ${
                    isDarkMode
                      ? "bg-slate-900 border-white/20"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <h3
                    className={`text-2xl font-bold mb-6 transition-colors duration-500 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Edit Note
                  </h3>

                  <textarea
                    className={`w-full rounded-2xl p-6 outline-none transition-all duration-300 resize-none font-light leading-relaxed text-base mb-4 border ${
                      isDarkMode
                        ? "bg-white/5 border-white/15 text-white placeholder-gray-500 focus:border-blue-300/70 focus:bg-white/10 focus:ring-2 focus:ring-blue-500/30"
                        : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500/70 focus:bg-white focus:ring-2 focus:ring-blue-500/30"
                    }`}
                    rows="8"
                    placeholder="Update your note..."
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    disabled={loading}
                  />

                  {/* Category selector for edit modal */}
                  <div className="mb-6 flex gap-3 items-center flex-wrap">
                    <select
                      value={editingCategory || ""}
                      onChange={(e) => setEditingCategory(e.target.value)}
                      disabled={loading}
                      className={`flex-1 min-w-[200px] rounded-xl px-4 py-2 outline-none transition-all duration-200 font-semibold border ${
                        isDarkMode
                          ? "bg-white/5 border-white/15 text-white focus:border-blue-300/70 focus:bg-white/10 focus:ring-2 focus:ring-blue-500/30"
                          : "bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500/70 focus:bg-white focus:ring-2 focus:ring-blue-500/30"
                      }`}
                    >
                      <option
                        value=""
                        className={isDarkMode ? "bg-slate-900" : "bg-white"}
                      >
                        No Category
                      </option>
                      {categories.map((cat) => (
                        <option
                          key={cat._id}
                          value={cat._id}
                          className={isDarkMode ? "bg-slate-900" : "bg-white"}
                        >
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => setShowCategoryModal(true)}
                      disabled={loading}
                      className={`px-4 py-2 font-semibold rounded-xl transition-all duration-200 disabled:cursor-not-allowed whitespace-nowrap border ${
                        isDarkMode
                          ? "bg-white/10 hover:bg-white/20 border-white/20 text-gray-300 hover:text-white"
                          : "bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-700 hover:text-gray-900"
                      }`}
                    >
                      + New
                    </button>
                  </div>

                  {/* Character count */}
                  <div
                    className={`text-sm mb-6 text-right transition-colors ${
                      editContent.trim().length < 5
                        ? isDarkMode
                          ? "text-red-400"
                          : "text-red-600"
                        : editContent.trim().length > 5000
                          ? isDarkMode
                            ? "text-red-400"
                            : "text-red-600"
                          : isDarkMode
                            ? "text-gray-400"
                            : "text-gray-600"
                    }`}
                  >
                    {editContent.length} / 5000 characters
                    {editContent.trim().length < 5 &&
                      editContent.trim().length > 0 && (
                        <span
                          className={`ml-2 ${isDarkMode ? "text-red-400" : "text-red-600"}`}
                        >
                          (minimum 5 required)
                        </span>
                      )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-4 justify-end">
                    <button
                      onClick={cancelEdit}
                      disabled={loading}
                      className={`px-6 py-3 font-semibold rounded-xl transition-all duration-200 disabled:cursor-not-allowed border ${
                        isDarkMode
                          ? "bg-gray-600/50 hover:bg-gray-600 border-gray-500/30 text-gray-300 hover:text-white"
                          : "bg-gray-200 hover:bg-gray-300 border-gray-300 text-gray-900 hover:text-gray-900"
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdate}
                      disabled={
                        loading ||
                        editContent.trim().length < 5 ||
                        editContent.trim().length > 5000
                      }
                      className={`px-6 py-3 font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 ${
                        loading ||
                        editContent.trim().length < 5 ||
                        editContent.trim().length > 5000
                          ? `${isDarkMode ? "bg-gray-600/50" : "bg-slate-600"} cursor-not-allowed ${isDarkMode ? "text-gray-300" : "text-gray-300"} ${isDarkMode ? "border border-gray-500/30" : "border border-slate-500"}`
                          : "bg-gradient-to-r from-blue-500 to-purple-600 text-white border border-blue-400/40 hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105 active:scale-95"
                      }`}
                    >
                      {loading ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Updating...
                        </>
                      ) : (
                        <>
                          <span>✨</span>
                          Update Note
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Category Creation Modal */}
            {showCategoryModal && (
              <div
                className={`fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-colors duration-500 ${
                  isDarkMode ? "bg-black/60" : "bg-black/30"
                }`}
              >
                <div
                  className={`border rounded-3xl p-8 max-w-md w-full shadow-2xl transition-colors duration-500 ${
                    isDarkMode
                      ? "bg-slate-900 border-white/20"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <h3
                    className={`text-2xl font-bold mb-6 transition-colors duration-500 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Create New Category
                  </h3>

                  {/* Category Name Input */}
                  <div className="mb-6">
                    <label
                      className={`block text-sm font-semibold mb-2 transition-colors duration-500 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Category Name
                    </label>
                    <input
                      type="text"
                      maxLength="20"
                      placeholder="e.g., Work, Ideas, Personal..."
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      disabled={loading}
                      className={`w-full rounded-xl px-4 py-3 outline-none focus:ring-2 transition-all duration-200 ${
                        isDarkMode
                          ? "bg-white/5 border border-white/15 text-white placeholder-gray-400 focus:border-blue-300/70 focus:bg-white/10 focus:ring-blue-500/30"
                          : "bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:bg-white focus:ring-blue-500/20"
                      }`}
                    />
                    <p
                      className={`text-xs mt-1 transition-colors duration-500 ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {newCategoryName.length}/20 characters
                    </p>
                  </div>

                  {/* Color Picker */}
                  <div className="mb-6">
                    <label
                      className={`block text-sm font-semibold mb-3 transition-colors duration-500 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Color
                    </label>
                    <div className="grid grid-cols-6 gap-2">
                      {[
                        "#FF6B6B",
                        "#4ECDC4",
                        "#45B7D1",
                        "#FFA07A",
                        "#98D8C8",
                        "#F7DC6F",
                        "#BB8FCE",
                        "#85C1E2",
                      ].map((color) => (
                        <button
                          key={color}
                          onClick={() => setNewCategoryColor(color)}
                          className={`h-8 rounded-lg border-2 transition-all duration-200 ${
                            newCategoryColor === color
                              ? "border-white shadow-lg scale-110"
                              : "border-white/20 hover:border-white/40"
                          }`}
                          style={{ backgroundColor: color }}
                          disabled={loading}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Icon Picker */}
                  <div className="mb-6">
                    <label
                      className={`block text-sm font-semibold mb-3 transition-colors duration-500 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Icon
                    </label>
                    <div className="grid grid-cols-8 gap-2">
                      {[
                        "📝",
                        "💼",
                        "🎯",
                        "💡",
                        "📚",
                        "🎨",
                        "🔥",
                        "⭐",
                        "🎭",
                        "🌟",
                        "💎",
                        "🚀",
                        "🎪",
                        "🎸",
                        "🏆",
                        "📸",
                      ].map((icon) => (
                        <button
                          key={icon}
                          onClick={() => setNewCategoryIcon(icon)}
                          className={`h-8 flex items-center justify-center text-lg rounded-lg border-2 transition-all duration-200 ${
                            newCategoryIcon === icon
                              ? "border-white bg-white/20 scale-110"
                              : "border-white/20 hover:border-white/40 hover:bg-white/10"
                          }`}
                          disabled={loading}
                          title={icon}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 justify-end">
                    <button
                      onClick={() => {
                        setShowCategoryModal(false);
                        setNewCategoryName("");
                        setNewCategoryColor("#45B7D1");
                        setNewCategoryIcon("📝");
                      }}
                      disabled={loading}
                      className="px-6 py-3 bg-gray-600/50 hover:bg-gray-600 border border-gray-500/30 text-gray-300 hover:text-white font-semibold rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        if (!newCategoryName.trim()) {
                          toast.error("Category name is required");
                          return;
                        }

                        setLoading(true);
                        try {
                          const token = localStorage.getItem("authToken");
                          const response = await fetch(
                            `${API_URL}/categories`,
                            {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                              },
                              body: JSON.stringify({
                                name: newCategoryName.trim(),
                                color: newCategoryColor,
                                icon: newCategoryIcon,
                              }),
                            },
                          );

                          const data = await response.json();

                          if (data.success) {
                            toast.success("Category created! ✨");
                            setCategories([data.data, ...categories]);
                            setShowCategoryModal(false);
                            setNewCategoryName("");
                            setNewCategoryColor("#4ECDC4");
                            setNewCategoryIcon("📝");
                          } else {
                            toast.error(
                              data.message || "Failed to create category",
                            );
                          }
                        } catch (error) {
                          toast.error("Error creating category");
                          console.error(error);
                        } finally {
                          setLoading(false);
                        }
                      }}
                      disabled={loading || !newCategoryName.trim()}
                      className={`px-6 py-3 font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 ${
                        loading || !newCategoryName.trim()
                          ? "bg-gray-600/50 cursor-not-allowed text-gray-300 border border-gray-500/30"
                          : "bg-gradient-to-r from-blue-500 to-purple-600 text-white border border-blue-400/40 hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105 active:scale-95"
                      }`}
                    >
                      {loading ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Creating...
                        </>
                      ) : (
                        <>
                          <span>✨</span>
                          Create Category
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Share Note Modal */}
            {showShareModal && (
              <div
                className={`fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-colors duration-500 ${
                  isDarkMode ? "bg-black/60" : "bg-black/30"
                }`}
              >
                <div
                  className={`border rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto transition-colors duration-500 ${
                    isDarkMode
                      ? "bg-slate-900 border-white/20"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <h3
                    className={`text-2xl font-bold mb-6 transition-colors duration-500 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Share This Note
                  </h3>

                  {/* Share with email input */}
                  <div className="mb-8">
                    <label
                      className={`block text-sm font-semibold mb-3 transition-colors duration-500 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Share with email address
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        placeholder="friend@example.com"
                        value={shareEmail}
                        onChange={(e) => setShareEmail(e.target.value)}
                        disabled={loading}
                        className={`flex-1 rounded-xl px-4 py-3 outline-none transition-all duration-200 border placeholder-gray-500 ${
                          isDarkMode
                            ? "bg-white/5 border-white/15 text-white focus:border-blue-300/70 focus:bg-white/10 focus:ring-2 focus:ring-blue-500/30"
                            : "bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                        }`}
                      />
                      <button
                        onClick={handleShare}
                        disabled={loading || !shareEmail.trim()}
                        className={`px-6 py-3 font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 ${
                          loading || !shareEmail.trim()
                            ? `${isDarkMode ? "bg-gray-600/50" : "bg-slate-600"} cursor-not-allowed ${isDarkMode ? "text-gray-300" : "text-gray-300"} ${isDarkMode ? "border border-gray-500/30" : "border border-slate-500"}`
                            : "bg-gradient-to-r from-purple-500 to-pink-600 text-white border border-purple-400/40 hover:shadow-lg hover:shadow-purple-500/50 hover:scale-105 active:scale-95"
                        }`}
                      >
                        {loading ? "Sharing..." : "Share"}
                      </button>
                    </div>
                  </div>

                  {/* Currently shared with */}
                  {noteShares && noteShares.length > 0 && (
                    <div
                      className={`mt-8 pt-6 border-t transition-colors duration-500 ${
                        isDarkMode ? "border-white/20" : "border-gray-200"
                      }`}
                    >
                      <h4
                        className={`text-sm font-semibold mb-4 transition-colors duration-500 ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Shared with ({noteShares.length})
                      </h4>
                      <div className="space-y-2">
                        {noteShares.map((share) => (
                          <div
                            key={share._id}
                            className={`flex items-center justify-between p-3 rounded-lg hover:transition-all duration-200 ${
                              isDarkMode
                                ? "bg-white/5 border border-white/10 hover:bg-white/10"
                                : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                            }`}
                          >
                            <div>
                              <p
                                className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
                              >
                                {share.sharedWithId.username}
                              </p>
                              <p
                                className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                              >
                                {share.sharedWithId.email}
                              </p>
                            </div>
                            <button
                              onClick={() => revokeShare(share._id)}
                              disabled={loading}
                              className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/40 border border-red-400/40 hover:border-red-400/70 text-red-300 hover:text-red-200 font-semibold rounded-lg text-sm transition-all duration-200 disabled:cursor-not-allowed"
                              title="Remove access"
                            >
                              Revoke
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Close button */}
                  <div className="mt-8 flex justify-end">
                    <button
                      onClick={() => setShowShareModal(false)}
                      disabled={loading}
                      className="px-6 py-3 bg-gray-600/50 hover:bg-gray-600 border border-gray-500/30 text-gray-300 hover:text-white font-semibold rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Settings/Password Update Modal */}
            {showSettingsModal && (
              <div
                className={`fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-colors duration-500 ${
                  isDarkMode ? "bg-black/60" : "bg-black/30"
                }`}
              >
                <div
                  className={`border rounded-3xl p-8 max-w-md w-full shadow-2xl transition-colors duration-500 ${
                    isDarkMode
                      ? "bg-slate-900 border-white/20"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <h3
                    className={`text-2xl font-bold mb-6 transition-colors duration-500 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Account Settings
                  </h3>

                  {/* Change Password Form */}
                  <div className="space-y-5">
                    <h4
                      className={`text-sm font-semibold transition-colors duration-500 ${
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Change Password
                    </h4>

                    {/* Current Password */}
                    <div>
                      <label
                        className={`block text-xs font-semibold mb-2 transition-colors duration-500 ${
                          isDarkMode ? "text-gray-400" : "text-gray-700"
                        }`}
                      >
                        Current Password
                      </label>
                      <input
                        type="password"
                        placeholder="Enter your current password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        disabled={loading}
                        className={`w-full rounded-xl px-4 py-3 outline-none transition-all duration-200 border placeholder-gray-500 ${
                          isDarkMode
                            ? "bg-white/5 border-white/15 text-white focus:border-blue-300/70 focus:bg-white/10 focus:ring-2 focus:ring-blue-500/30"
                            : "bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                        }`}
                      />
                    </div>

                    {/* New Password */}
                    <div>
                      <label
                        className={`block text-xs font-semibold mb-2 transition-colors duration-500 ${
                          isDarkMode ? "text-gray-400" : "text-gray-700"
                        }`}
                      >
                        New Password
                      </label>
                      <input
                        type="password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={loading}
                        className={`w-full rounded-xl px-4 py-3 outline-none transition-all duration-200 border placeholder-gray-500 ${
                          isDarkMode
                            ? "bg-white/5 border-white/15 text-white focus:border-blue-300/70 focus:bg-white/10 focus:ring-2 focus:ring-blue-500/30"
                            : "bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                        }`}
                      />
                    </div>

                    {/* Confirm New Password */}
                    <div>
                      <label
                        className={`block text-xs font-semibold mb-2 transition-colors duration-500 ${
                          isDarkMode ? "text-gray-400" : "text-gray-700"
                        }`}
                      >
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        disabled={loading}
                        className={`w-full rounded-xl px-4 py-3 outline-none transition-all duration-200 border placeholder-gray-500 ${
                          isDarkMode
                            ? "bg-white/5 border-white/15 text-white focus:border-blue-300/70 focus:bg-white/10 focus:ring-2 focus:ring-blue-500/30"
                            : "bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                        }`}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 justify-end pt-4">
                      <button
                        onClick={() => {
                          setShowSettingsModal(false);
                          setOldPassword("");
                          setNewPassword("");
                          setConfirmNewPassword("");
                        }}
                        disabled={loading}
                        className={`px-6 py-3 font-semibold rounded-xl transition-all duration-200 disabled:cursor-not-allowed border ${
                          isDarkMode
                            ? "bg-gray-600/50 hover:bg-gray-600 border-gray-500/30 text-gray-300 hover:text-white"
                            : "bg-slate-600 hover:bg-slate-500 border-slate-500 text-white hover:text-white"
                        }`}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdatePassword}
                        disabled={
                          loading ||
                          !oldPassword ||
                          !newPassword ||
                          !confirmNewPassword
                        }
                        className={`px-6 py-3 font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 ${
                          loading ||
                          !oldPassword ||
                          !newPassword ||
                          !confirmNewPassword
                            ? "bg-gray-600/50 cursor-not-allowed text-gray-300 border border-gray-500/30"
                            : "bg-gradient-to-r from-blue-500 to-purple-600 text-white border border-blue-400/40 hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105 active:scale-95"
                        }`}
                      >
                        {loading ? (
                          <>
                            <svg
                              className="animate-spin h-5 w-5"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Updating...
                          </>
                        ) : (
                          <>
                            <span>✨</span>
                            Update Password
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Note Preview Modal */}
            {previewNote && (
              <NotePreviewModal
                note={previewNote}
                isDarkMode={isDarkMode}
                onClose={() => setPreviewNote(null)}
                onEdit={() => {
                  startEdit(previewNote);
                  setPreviewNote(null);
                }}
                onShare={() => {
                  openShareModal(previewNote._id);
                  setPreviewNote(null);
                }}
                onFavorite={() => {
                  toggleFavorite(previewNote._id);
                  setPreviewNote(null);
                }}
                onArchive={() => {
                  toggleArchive(previewNote._id);
                  setPreviewNote(null);
                }}
                onDelete={() => {
                  deleteNote(previewNote._id);
                  setPreviewNote(null);
                }}
              />
            )}

            {/* Export Modal */}
            {showExportModal && (
              <ExportModal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                selectedCategory={selectedCategory}
                selectedTags={selectedTags}
                search={search}
              />
            )}

            {/* Note Templates Modal */}
            {showTemplatesModal && (
              <NoteTemplatesModal
                isOpen={showTemplatesModal}
                onClose={() => setShowTemplatesModal(false)}
                isDarkMode={isDarkMode}
                onSelectTemplate={handleSelectTemplate}
              />
            )}

            {/* Bulk Actions Bar */}
            {isBulkSelectMode && selectedNotes.size > 0 && (
              <BulkActionsBar
                selectedCount={selectedNotes.size}
                totalCount={notes.length}
                onSelectAll={() =>
                  setSelectedNotes(new Set(notes.map((n) => n._id)))
                }
                onClearSelection={() => setSelectedNotes(new Set())}
                onArchive={handleBulkArchive}
                onFavorite={handleBulkFavorite}
                onDelete={handleBulkDelete}
                isLoading={loading}
              />
            )}

            {/* Tag Manager Modal */}
            {showTagManager && (
              <TagManager
                isOpen={showTagManager}
                onClose={() => setShowTagManager(false)}
                tags={tags}
                onTagCreated={() => fetchTags()}
              />
            )}

            {/* Keyboard Shortcuts Help Modal */}
            {showKeyboardHelp && (
              <KeyboardShortcutsHelp
                isOpen={showKeyboardHelp}
                onClose={() => setShowKeyboardHelp(false)}
              />
            )}

            {/* Header Section - Compact */}
            <div className="text-center mb-12 animate-fade-in">
              <div className="mb-4 flex justify-center">
                <div className="text-5xl sm:text-6xl drop-shadow-lg">🧠</div>
              </div>
              <h1 className="text-5xl sm:text-6xl font-bold mb-3 bg-gradient-to-r from-blue-300 via-cyan-300 to-purple-300 bg-clip-text text-transparent tracking-tight">
                AI Notes
              </h1>
              <p className="text-lg sm:text-xl text-gray-300 font-light">
                Capture your thoughts. Let AI summarize.
              </p>
            </div>

            {/* Input Card - Premium Glassmorphism */}
            <div className="mb-16">
              <div className="group relative">
                {/* Enhanced glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/40 to-purple-500/40 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:blur-3xl"></div>

                {/* Glass Card */}
                <div className="relative bg-white/10 backdrop-blur-2xl border border-white/25 rounded-3xl p-8 sm:p-10 shadow-2xl hover:shadow-3xl hover:bg-white/15 transition-all duration-500">
                  {/* Label */}
                  <label className="block text-sm font-semibold text-blue-300 mb-4 tracking-wide uppercase">
                    + Create a New Note
                  </label>

                  {/* Category Selector */}
                  <div className="mb-6 flex flex-wrap gap-2 items-center">
                    <span
                      className={`text-sm font-semibold mr-2 transition-colors duration-500 ${
                        isDarkMode ? "text-gray-400" : "text-gray-700"
                      }`}
                    >
                      Category:
                    </span>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className={`rounded-lg px-4 py-2 outline-none transition-all duration-300 text-sm font-semibold border ${
                        isDarkMode
                          ? "bg-white/5 border-white/15 text-white focus:border-blue-300/70 focus:ring-2 focus:ring-blue-500/30"
                          : "bg-white border-gray-300 text-gray-900 focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/30"
                      }`}
                    >
                      <option
                        value=""
                        className={isDarkMode ? "bg-slate-900" : "bg-white"}
                      >
                        No Category
                      </option>
                      {categories.map((cat) => (
                        <option
                          key={cat._id}
                          value={cat._id}
                          className={isDarkMode ? "bg-slate-900" : "bg-white"}
                        >
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => setShowCategoryModal(true)}
                      className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 font-semibold border ${
                        isDarkMode
                          ? "bg-white/10 hover:bg-white/20 border-white/20 text-gray-300 hover:text-white"
                          : "bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-700 hover:text-gray-900"
                      }`}
                      title="Create new category"
                    >
                      + New
                    </button>
                  </div>

                  {/* Textarea - Enhanced */}
                  <textarea
                    className={`w-full rounded-2xl p-5 sm:p-6 outline-none transition-all duration-300 resize-none font-light leading-relaxed text-base mb-3 ${
                      isDarkMode
                        ? "bg-white/5 border border-white/15 text-white placeholder-gray-400 focus:border-blue-300/70 focus:bg-white/10 focus:ring-2 focus:ring-blue-500/30"
                        : "bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                    }`}
                    rows="7"
                    placeholder="What's on your mind? Share your thoughts, ideas, or anything you'd like summarized..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    disabled={loading}
                  />

                  {/* Character count */}
                  <div
                    className={`text-sm mb-6 text-right transition-colors ${
                      note.trim().length < 5
                        ? isDarkMode
                          ? "text-red-400"
                          : "text-red-600"
                        : note.trim().length > 5000
                          ? isDarkMode
                            ? "text-red-400"
                            : "text-red-600"
                          : isDarkMode
                            ? "text-gray-400"
                            : "text-gray-600"
                    }`}
                  >
                    {note.length} / 5000 characters
                    {note.trim().length < 5 && note.trim().length > 0 && (
                      <span
                        className={`ml-2 ${isDarkMode ? "text-red-400" : "text-red-600"}`}
                      >
                        (minimum 5 required)
                      </span>
                    )}
                  </div>

                  {/* Button - Premium Styled */}
                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={handleSubmit}
                      disabled={
                        loading ||
                        note.trim().length < 5 ||
                        note.trim().length > 5000
                      }
                      className={`mt-2 px-8 py-4 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-3 group/btn ${
                        loading ||
                        note.trim().length < 5 ||
                        note.trim().length > 5000
                          ? "bg-gray-600/50 cursor-not-allowed text-gray-300 border border-gray-500/30"
                          : "bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 text-white border border-blue-400/40 hover:border-blue-300/60 hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-105 active:scale-95 shadow-lg"
                      }`}
                    >
                      {loading ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          <span className="font-medium">
                            AI is summarizing...
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-xl group-hover/btn:scale-110 transition-transform">
                            ✨
                          </span>
                          <span className="font-semibold text-lg">
                            Create Note
                          </span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setShowTemplatesModal(true)}
                      className={`mt-2 px-8 py-4 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-3 group/template ${
                        isDarkMode
                          ? "bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/40 hover:border-cyan-400/70 hover:shadow-lg hover:shadow-cyan-500/20 hover:scale-105 active:scale-95"
                          : "bg-cyan-100 border border-cyan-300 text-cyan-700 hover:bg-cyan-200 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-400/20 hover:scale-105 active:scale-95"
                      }`}
                    >
                      <span className="text-xl group-hover/template:rotate-12 transition-transform">
                        📋
                      </span>
                      <span className="font-semibold">Use Template</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes List Section */}
            <div>
              {/* Search, Sort, and Filter Bar */}
              {notes.length > 0 || search ? (
                <div className="mb-10">
                  {/* Heading with result count */}
                  <div className="mb-8">
                    <h2
                      className={`text-4xl font-bold mb-2 transition-colors duration-500 ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {search ? `Search Results: "${search}"` : "Your Notes"}
                    </h2>
                    <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                    {pagination && (
                      <p
                        className={`text-sm mt-3 transition-colors duration-500 ${
                          isDarkMode ? "text-gray-400" : "text-gray-700"
                        }`}
                      >
                        Showing {notes.length} of {pagination.total} notes
                      </p>
                    )}
                  </div>

                  {/* Search Bar with History */}
                  <div className="mb-6">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="🔍 Search notes by content or summary..."
                        value={search}
                        onChange={handleSearch}
                        onFocus={() =>
                          searchHistory.length > 0 && setShowSearchHistory(true)
                        }
                        disabled={isFetching}
                        className={`w-full rounded-2xl px-6 py-3 outline-none transition-all duration-300 disabled:opacity-50 ${
                          isDarkMode
                            ? "bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:border-blue-300/70 focus:bg-white/15 focus:ring-2 focus:ring-blue-500/30"
                            : "bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                        }`}
                      />
                      {isFetching && (
                        <svg
                          className="animate-spin h-5 w-5 absolute right-4 top-3.5 text-blue-400"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      )}

                      {/* Search History Dropdown */}
                      {showSearchHistory && searchHistory.length > 0 && (
                        <div
                          className={`absolute top-full left-0 right-0 mt-2 rounded-xl border z-40 max-h-64 overflow-y-auto ${
                            isDarkMode
                              ? "bg-slate-800 border-white/20"
                              : "bg-white border-gray-300"
                          }`}
                        >
                          <div
                            className={`p-2 border-b sticky top-0 ${
                              isDarkMode
                                ? "border-white/10 bg-slate-800"
                                : "border-gray-200 bg-white"
                            }`}
                          >
                            <button
                              onClick={clearSearchHistory}
                              className={`text-xs w-full text-left px-3 py-1 rounded transition-colors ${
                                isDarkMode
                                  ? "text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                                  : "text-gray-600 hover:text-red-600 hover:bg-red-50"
                              }`}
                            >
                              Clear History
                            </button>
                          </div>
                          {searchHistory.map((item, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSearchHistorySelect(item)}
                              className={`w-full text-left px-4 py-2 hover:bg-white/10 transition-colors text-sm border-b last:border-b-0 ${
                                isDarkMode
                                  ? "text-gray-300 hover:bg-white/5"
                                  : "text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              🔍 {item}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sort Buttons */}
                  <div className="flex flex-wrap gap-3 mb-8">
                    <span
                      className={`text-sm font-semibold self-center transition-colors duration-500 ${
                        isDarkMode ? "text-gray-400" : "text-gray-700"
                      }`}
                    >
                      Sort by:
                    </span>
                    {[
                      { label: "Newest First", value: "date" },
                      { label: "Oldest First", value: "oldest" },
                      { label: "A-Z", value: "alphabetical" },
                      { label: "Z-A", value: "alphabetical-desc" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleSort(option.value)}
                        disabled={isFetching}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 disabled:opacity-50 ${
                          sort === option.value
                            ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white border border-blue-400/40 shadow-lg shadow-blue-500/30"
                            : "bg-white/10 border border-white/20 text-gray-300 hover:text-white hover:bg-white/15 hover:border-blue-400/40"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>

                  {/* Filter Options */}
                  <div
                    className={`flex flex-wrap gap-3 items-center mb-8 p-4 rounded-xl border transition-colors duration-500 ${
                      isDarkMode
                        ? "bg-white/5 border-white/10"
                        : "bg-slate-800/50 border-slate-700"
                    }`}
                  >
                    <span
                      className={`text-sm font-semibold transition-colors duration-500 ${
                        isDarkMode ? "text-gray-400" : "text-gray-300"
                      }`}
                    >
                      Filters:
                    </span>
                    <button
                      onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                      disabled={isFetching}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 disabled:opacity-50 flex items-center gap-2 ${
                        showFavoritesOnly
                          ? "bg-yellow-500/40 border border-yellow-400/70 text-yellow-200 shadow-lg shadow-yellow-500/30"
                          : "bg-yellow-500/20 border border-yellow-400/40 text-yellow-300 hover:text-yellow-200 hover:bg-yellow-500/30"
                      }`}
                      title={
                        showFavoritesOnly
                          ? "Showing favorites only"
                          : "Show all notes"
                      }
                    >
                      <span>⭐</span>
                      <span>
                        Favorites{showFavoritesOnly ? " (Active)" : ""}
                      </span>
                    </button>
                    <button
                      onClick={() => setShowArchivedOnly(!showArchivedOnly)}
                      disabled={isFetching}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 disabled:opacity-50 flex items-center gap-2 ${
                        showArchivedOnly
                          ? "bg-orange-500/40 border border-orange-400/70 text-orange-200 shadow-lg shadow-orange-500/30"
                          : "bg-orange-500/20 border border-orange-400/40 text-orange-300 hover:text-orange-200 hover:bg-orange-500/30"
                      }`}
                      title={
                        showArchivedOnly
                          ? "Showing archived notes only"
                          : "Hide archived notes"
                      }
                    >
                      <span>📦</span>
                      <span>Archived{showArchivedOnly ? " (Active)" : ""}</span>
                    </button>
                    {tags.length > 0 && (
                      <div className="flex items-center gap-2">
                        <label
                          htmlFor="tagFilter"
                          className="text-gray-400 text-sm font-semibold"
                        >
                          Tags:
                        </label>
                        <select
                          id="tagFilter"
                          multiple
                          value={selectedTags}
                          onChange={(e) =>
                            setSelectedTags(
                              Array.from(
                                e.target.selectedOptions,
                                (option) => option.value,
                              ),
                            )
                          }
                          disabled={isFetching}
                          className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm outline-none focus:border-blue-300/70 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200 disabled:opacity-50"
                          title="Hold Ctrl/Cmd to select multiple tags"
                        >
                          <option value="">All Tags</option>
                          {tags.map((tag) => (
                            <option key={tag._id} value={tag._id}>
                              {tag.icon} {tag.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    {selectedTags.length > 0 && (
                      <button
                        onClick={() => setSelectedTags([])}
                        className="px-3 py-2 text-xs bg-red-500/20 hover:bg-red-500/40 border border-red-400/40 text-red-300 hover:text-red-200 rounded-lg transition-all"
                        title="Clear tag filters"
                      >
                        Clear Tags ✕
                      </button>
                    )}
                    {selectedCategory && (
                      <button
                        onClick={() => setSelectedCategory("")}
                        className="px-3 py-2 text-xs bg-red-500/20 hover:bg-red-500/40 border border-red-400/40 text-red-300 hover:text-red-200 rounded-lg transition-all"
                        title="Clear category filter"
                      >
                        Clear Category ✕
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setShowFavoritesOnly(false);
                        setShowArchivedOnly(false);
                        setSelectedTags([]);
                        setSelectedCategory("");
                        setSearch("");
                        handleSort("date");
                      }}
                      disabled={
                        isFetching ||
                        (!showFavoritesOnly &&
                          !showArchivedOnly &&
                          selectedTags.length === 0 &&
                          !selectedCategory &&
                          !search)
                      }
                      className="px-4 py-2 ml-auto text-sm bg-gray-600/30 hover:bg-gray-600/50 border border-gray-500/40 text-gray-300 hover:text-white rounded-lg transition-all disabled:opacity-50"
                      title="Reset all filters"
                    >
                      Reset All Filters
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mb-10">
                  <h2
                    className={`text-4xl font-bold mb-2 transition-colors duration-500 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    No Notes Yet
                  </h2>
                  <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                </div>
              )}

              {notes.length === 0 ? (
                /* Empty State - Premium */
                <div className="grid place-items-center py-24">
                  <div className="text-center">
                    <div className="inline-block mb-6 p-6 bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl">
                      <span className="text-6xl block">📝</span>
                    </div>
                    <h3
                      className={`text-3xl font-bold mb-3 transition-colors duration-500 ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {search ? "No Notes Found" : "No Notes Created Yet"}
                    </h3>
                    <p
                      className={`font-light text-lg max-w-sm mx-auto mb-8 transition-colors duration-500 ${
                        isDarkMode ? "text-gray-400" : "text-gray-700"
                      }`}
                    >
                      {search ? (
                        <>Try a different search term or create a new note.</>
                      ) : (
                        <>
                          Start your journey by creating your first note. Our AI
                          will instantly generate a summary for you.
                        </>
                      )}
                    </p>
                    {!search && (
                      <div className="inline-block px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-gray-300 font-light">
                        👆 Create a note above to get started
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 auto-rows-max">
                    {notes
                      .filter((n) => !n.isArchived || showArchivedOnly)
                      .map((n, index) => (
                        <div
                          key={n._id}
                          className="group relative animate-fade-in"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          {/* Card glow effect */}
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

                          {/* Glass Note Card */}
                          <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-7 sm:p-8 shadow-xl hover:shadow-2xl hover:bg-white/15 transition-all duration-300 group-hover:border-blue-400/50 group-hover:-translate-y-1 h-full flex flex-col">
                            {/* Bulk Select Toggle & Indicators with Star Favorite */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() =>
                                    setIsBulkSelectMode(!isBulkSelectMode)
                                  }
                                  className="text-xs px-2 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded text-gray-300 hover:text-white transition-all"
                                  title={
                                    isBulkSelectMode
                                      ? "Done selecting"
                                      : "Bulk select mode"
                                  }
                                >
                                  {isBulkSelectMode ? "✓" : "◻"}
                                </button>
                                {isBulkSelectMode && (
                                  <input
                                    type="checkbox"
                                    checked={selectedNotes.has(n._id)}
                                    onChange={(e) => {
                                      const newSelection = new Set(
                                        selectedNotes,
                                      );
                                      if (e.target.checked) {
                                        newSelection.add(n._id);
                                      } else {
                                        newSelection.delete(n._id);
                                      }
                                      setSelectedNotes(newSelection);
                                    }}
                                    className="w-5 h-5 rounded accent-blue-400 cursor-pointer"
                                    title="Select note for bulk operations"
                                  />
                                )}
                                <div className="flex gap-2">
                                  {n.isArchived && (
                                    <span
                                      className="inline-block bg-orange-500/30 text-orange-200 text-xs font-bold px-2 py-1 rounded-full"
                                      title="Archived"
                                    >
                                      📦 Archived
                                    </span>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => toggleFavorite(n._id)}
                                className="p-1 hover:scale-125 transition-transform duration-200"
                                title={
                                  n.isFavorited
                                    ? "Remove from favorites"
                                    : "Add to favorites"
                                }
                              >
                                {n.isFavorited ? (
                                  <Star
                                    size={20}
                                    fill="currentColor"
                                    className="text-yellow-400"
                                  />
                                ) : (
                                  <Star
                                    size={20}
                                    className="text-gray-400 hover:text-yellow-400"
                                  />
                                )}
                              </button>
                            </div>

                            {/* Category Badge */}
                            {n.categoryId && (
                              <div className="mb-4">
                                <button
                                  onClick={() =>
                                    handleCategoryFilter(n.categoryId._id)
                                  }
                                  className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 hover:bg-white/25 border border-white/25 hover:border-white/40 rounded-lg text-sm font-medium text-gray-200 hover:text-white transition-all duration-200"
                                  title="Filter by this category"
                                >
                                  <span className="text-base">
                                    {n.categoryId.icon}
                                  </span>
                                  <span>{n.categoryId.name}</span>
                                </button>
                              </div>
                            )}

                            {/* Tags Display */}
                            {n.tags && n.tags.length > 0 && (
                              <div className="mb-4 flex flex-wrap gap-2">
                                {n.tags.map((tag) => (
                                  <button
                                    key={tag._id}
                                    onClick={() => setSelectedTags([tag._id])}
                                    className="text-xs px-2 py-1 rounded-full border transition-all"
                                    style={{
                                      backgroundColor: `${tag.color}20`,
                                      borderColor: `${tag.color}40`,
                                      color: tag.color,
                                    }}
                                    title={`Filter by tag: ${tag.name}`}
                                  >
                                    {tag.icon} {tag.name}
                                  </button>
                                ))}
                              </div>
                            )}

                            {/* Note Summary - Show only first 150 characters */}
                            <div className="mb-6 flex-1">
                              <p
                                className={`leading-relaxed text-base font-light transition-colors duration-500 ${
                                  isDarkMode ? "text-gray-100" : "text-gray-800"
                                }`}
                              >
                                {n.text?.substring(0, 150)}
                                {n.text?.length > 150 ? "..." : ""}
                              </p>
                            </div>

                            {/* Metadata Row - Word Count, Date, Reading Time */}
                            <div
                              className={`mb-4 flex flex-wrap gap-4 text-xs transition-colors duration-500 ${
                                isDarkMode ? "text-gray-400" : "text-gray-600"
                              }`}
                            >
                              <span title="Word count">
                                📊 {n.wordCount || 0} words
                              </span>
                              <span title="Creation date">
                                📅{" "}
                                {formatDistanceToNow(new Date(n.createdAt), {
                                  addSuffix: true,
                                })}
                              </span>
                              <span title="Estimated reading time">
                                ⏱️ {Math.ceil((n.wordCount || 0) / 200)} min
                                read
                              </span>
                            </div>

                            {/* Divider */}
                            <div
                              className={`h-px mb-6 transition-colors duration-500 ${
                                isDarkMode
                                  ? "bg-gradient-to-r from-blue-500/0 via-blue-400/20 to-purple-500/0"
                                  : "bg-gradient-to-r from-blue-400/0 via-blue-300/20 to-purple-400/0"
                              }`}
                            ></div>

                            {/* AI Summary Section */}
                            <div className="mb-6 hidden"></div>

                            {/* Action Buttons - Updated with new actions */}
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => setPreviewNote(n)}
                                className="bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-400/40 hover:border-cyan-400/70 text-cyan-300 hover:text-cyan-200 font-semibold py-2 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/20 active:scale-95 flex items-center justify-center gap-1 text-sm"
                                title="Preview note"
                              >
                                <Eye size={16} />
                                <span>Preview</span>
                              </button>
                              <button
                                onClick={() => exportNoteToPDF(n._id)}
                                disabled={loading}
                                className="bg-green-500/20 hover:bg-green-500/40 border border-green-400/40 hover:border-green-400/70 text-green-300 hover:text-green-200 font-semibold py-2 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-green-500/20 active:scale-95 flex items-center justify-center gap-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Export note as PDF"
                              >
                                <Download size={16} />
                                <span>Export PDF</span>
                              </button>
                              <button
                                onClick={() => toggleArchive(n._id)}
                                className={`border font-semibold py-2 rounded-lg transition-all duration-200 active:scale-95 flex items-center justify-center gap-1 text-sm ${
                                  n.isArchived
                                    ? "bg-orange-500/40 border-orange-400/70 text-orange-200 hover:bg-orange-500/50 hover:shadow-lg hover:shadow-orange-500/20"
                                    : "bg-orange-500/20 border-orange-400/40 text-orange-300 hover:text-orange-200 hover:bg-orange-500/40 hover:border-orange-400/70 hover:shadow-lg hover:shadow-orange-500/20"
                                }`}
                                title={n.isArchived ? "Unarchive" : "Archive"}
                              >
                                <span>
                                  {n.isArchived ? (
                                    <Archive size={16} />
                                  ) : (
                                    <Archive size={16} />
                                  )}
                                </span>
                                <span>
                                  {n.isArchived ? "Archived" : "Archive"}
                                </span>
                              </button>
                              <button
                                onClick={() => duplicateNote(n._id)}
                                className="bg-purple-500/20 hover:bg-purple-500/40 border border-purple-400/40 hover:border-purple-400/70 text-purple-300 hover:text-purple-200 font-semibold py-2 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/20 active:scale-95 flex items-center justify-center gap-1 text-sm"
                                title="Duplicate note"
                              >
                                <Copy size={16} />
                                <span>Duplicate</span>
                              </button>
                              <button
                                onClick={() => startEdit(n)}
                                className="bg-blue-500/20 hover:bg-blue-500/40 border border-blue-400/40 hover:border-blue-400/70 text-blue-300 hover:text-blue-200 font-semibold py-2 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-1 text-sm"
                                title="Edit note"
                              >
                                <Edit size={16} />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => openShareModal(n._id)}
                                className="bg-indigo-500/20 hover:bg-indigo-500/40 border border-indigo-400/40 hover:border-indigo-400/70 text-indigo-300 hover:text-indigo-200 font-semibold py-2 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-1 text-sm"
                                title="Share note"
                              >
                                <Share2 size={16} />
                                <span>Share</span>
                              </button>
                              <button
                                onClick={() => deleteNote(n._id)}
                                className="col-span-2 bg-red-500/20 hover:bg-red-500/40 border border-red-400/40 hover:border-red-400/70 text-red-300 hover:text-red-200 font-semibold py-2 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-red-500/20 active:scale-95 flex items-center justify-center gap-1 text-sm"
                                title="Delete note"
                              >
                                <Trash2 size={16} />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Pagination Controls */}
                  {pagination && pagination.totalPages > 1 && (
                    <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
                      <button
                        onClick={handlePrevPage}
                        disabled={!pagination.hasPrevPage || isFetching}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                          !pagination.hasPrevPage || isFetching
                            ? "bg-gray-600/50 cursor-not-allowed text-gray-400 border border-gray-500/30"
                            : "bg-blue-500/20 hover:bg-blue-500/40 border border-blue-400/40 text-blue-300 hover:text-blue-200 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95"
                        }`}
                      >
                        ← Previous
                      </button>

                      <div className="text-gray-400 font-medium px-4 text-center">
                        Page{" "}
                        <span className="text-blue-300 font-bold">
                          {pagination.page}
                        </span>{" "}
                        of{" "}
                        <span className="text-purple-300 font-bold">
                          {pagination.totalPages}
                        </span>
                      </div>

                      <button
                        onClick={handleNextPage}
                        disabled={!pagination.hasNextPage || isFetching}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                          !pagination.hasNextPage || isFetching
                            ? "bg-gray-600/50 cursor-not-allowed text-gray-400 border border-gray-500/30"
                            : "bg-purple-500/20 hover:bg-purple-500/40 border border-purple-400/40 text-purple-300 hover:text-purple-200 hover:shadow-lg hover:shadow-purple-500/20 active:scale-95"
                        }`}
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Footer */}
              <div
                className={`mt-20 pt-12 border-t transition-colors duration-500 ${
                  isDarkMode ? "border-white/10" : "border-gray-300/20"
                }`}
              >
                <p
                  className={`text-center text-sm font-light tracking-wide transition-colors duration-500 ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Crafted with precision using React, Tailwind CSS & AI
                  technology
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
          opacity: 0;
        }

        .delay-700 {
          animation-delay: 700ms;
        }

        .delay-300 {
          animation-delay: 300ms;
        }

        .delay-500 {
          animation-delay: 500ms;
        }

        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </div>
  );
};

export default Home;
