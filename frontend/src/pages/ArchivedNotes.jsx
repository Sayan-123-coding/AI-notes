import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import SkeletonLoader from "../components/SkeletonLoader";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const ArchivedNotes = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem("darkMode") === "true",
  );

  const fetchArchivedNotes = async (searchQuery = "", pageNum = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: searchQuery,
        page: pageNum,
        limit: 10,
        isArchived: "true",
      });

      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_URL}/notes?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        setNotes(data.data);
        setPagination(data.pagination);
      } else {
        toast.error("Failed to load archived notes");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load archived notes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchivedNotes("", 1);
  }, []);

  const handleUnarchive = async (noteId) => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_URL}/notes/${noteId}/archive`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        setNotes(notes.filter((n) => n._id !== noteId));
        toast.success("Note unarchived! 📝");
      } else {
        toast.error(data.message || "Failed to unarchive note");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error unarchiving note");
    }
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm("Permanently delete this note?")) return;

    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_URL}/notes/${noteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        setNotes(notes.filter((n) => n._id !== noteId));
        toast.success("Note deleted! 🗑️");
      } else {
        toast.error(data.message || "Failed to delete note");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting note");
    }
  };

  return (
    <div
      className={`min-h-screen relative overflow-hidden transition-colors duration-500 ${
        isDarkMode
          ? "bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950"
          : "bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50"
      }`}
    >
      {/* Background blobs */}
      <div
        className={`absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl animate-pulse ${
          isDarkMode ? "bg-blue-500/30" : "bg-blue-300/20"
        }`}
      ></div>
      <div
        className={`absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl animate-pulse delay-700 ${
          isDarkMode ? "bg-purple-500/25" : "bg-indigo-300/20"
        }`}
      ></div>

      {/* Content */}
      <div className="relative z-10 min-h-screen px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate("/")}
              className={`flex items-center gap-1.5 px-3 py-2 sm:px-4 rounded-lg font-semibold transition-all duration-200 border ${
                isDarkMode
                  ? "bg-blue-500/20 hover:bg-blue-500/40 border border-blue-400/40 text-blue-300 hover:text-blue-200"
                  : "bg-blue-100 hover:bg-blue-200 border border-blue-200 text-blue-700 hover:text-blue-800"
              }`}
              title="Back to Notes"
            >
              <span>←</span>
              <span className="hidden md:inline">Back to Notes</span>
            </button>
          </div>

          <div className="text-center mb-8">
            <h1
              className={`text-5xl font-bold mb-3 ${
                isDarkMode
                  ? "bg-gradient-to-r from-blue-300 via-cyan-300 to-purple-300 bg-clip-text text-transparent"
                  : "text-slate-800"
              }`}
            >
              Archived Notes
            </h1>
            <p className={isDarkMode ? "text-gray-400" : "text-slate-500"}>
              {notes.length} archived note{notes.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Search */}
          <div className="relative mb-8">
            <input
              type="text"
              placeholder="🔍 Search archived notes..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
                fetchArchivedNotes(e.target.value, 1);
              }}
              disabled={loading}
              className="w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-3 text-white placeholder-gray-400 outline-none focus:border-blue-300/70 focus:bg-white/15 focus:ring-2 focus:ring-blue-500/30 transition-all duration-300"
            />
          </div>
        </div>

        {/* Notes Grid */}
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <SkeletonLoader count={2} />
          ) : notes.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {search ? "No Archived Notes Found" : "No Archived Notes"}
              </h3>
              <p className="text-gray-400 max-w-sm mx-auto">
                {search
                  ? "Try a different search term."
                  : "Archive notes to remove them from your active list."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <div
                  key={note._id}
                  className={`group relative border rounded-2xl p-6 sm:p-8 transition-all duration-300 ${
                    isDarkMode
                      ? "bg-white/10 backdrop-blur-2xl border-white/20 hover:bg-white/15 hover:border-blue-400/50"
                      : "bg-white border-gray-200 shadow-lg hover:shadow-xl hover:border-blue-300"
                  }`}
                >
                  {/* Category */}
                  {note.categoryId && (
                    <div className="mb-3">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1 border rounded-lg text-sm font-medium transition-colors duration-500 ${
                          isDarkMode
                            ? "bg-white/15 border-white/25 text-gray-200"
                            : "bg-blue-50 border-blue-100 text-blue-700"
                        }`}
                      >
                        <span>{note.categoryId.icon}</span>
                        {note.categoryId.name}
                      </span>
                    </div>
                  )}

                  {/* Content Preview */}
                  <p
                    className={`leading-relaxed mb-4 line-clamp-3 transition-colors duration-500 ${
                      isDarkMode ? "text-gray-100" : "text-slate-700"
                    }`}
                  >
                    {note.text}
                  </p>

                  {/* Meta */}
                  <div
                    className={`flex items-center gap-4 text-xs mb-4 ${isDarkMode ? "text-gray-400" : "text-slate-500"}`}
                  >
                    <span>
                      📅 {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                    <span>📝 {note.wordCount} words</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleUnarchive(note._id)}
                      className={`flex-1 font-semibold py-2 rounded-lg text-sm transition-all duration-200 border ${
                        isDarkMode
                          ? "bg-blue-500/20 hover:bg-blue-500/40 border-blue-400/40 text-blue-300 hover:text-blue-200"
                          : "bg-blue-600 hover:bg-blue-700 border-blue-700 text-white"
                      }`}
                    >
                      📂 Unarchive
                    </button>
                    <button
                      onClick={() => handleDelete(note._id)}
                      className={`flex-1 font-semibold py-2 rounded-lg text-sm transition-all duration-200 border ${
                        isDarkMode
                          ? "bg-red-500/20 hover:bg-red-500/40 border-red-400/40 text-red-300 hover:text-red-200"
                          : "bg-red-50 hover:bg-red-100 border-red-200 text-red-600 hover:text-red-700"
                      }`}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-4">
              <button
                onClick={() => {
                  setPage(page - 1);
                  fetchArchivedNotes(search, page - 1);
                }}
                disabled={!pagination.hasPrevPage || loading}
                className={`px-6 py-3 border rounded-lg font-semibold transition-all duration-200 ${
                  !pagination.hasPrevPage || loading
                    ? isDarkMode
                      ? "bg-gray-600/50 cursor-not-allowed text-gray-300 border-gray-500/30"
                      : "bg-gray-100 cursor-not-allowed text-gray-400 border-gray-200"
                    : isDarkMode
                      ? "bg-blue-500/20 hover:bg-blue-500/40 border-blue-400/40 text-blue-300"
                      : "bg-blue-100 hover:bg-blue-200 border-blue-200 text-blue-700"
                }`}
              >
                ← Previous
              </button>
              <span className={isDarkMode ? "text-gray-400" : "text-slate-600"}>
                Page {page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => {
                  setPage(page + 1);
                  fetchArchivedNotes(search, page + 1);
                }}
                disabled={!pagination.hasNextPage || loading}
                className={`px-6 py-3 border rounded-lg font-semibold transition-all duration-200 ${
                  !pagination.hasNextPage || loading
                    ? isDarkMode
                      ? "bg-gray-600/50 cursor-not-allowed text-gray-300 border-gray-500/30"
                      : "bg-gray-100 cursor-not-allowed text-gray-400 border-gray-200"
                    : isDarkMode
                      ? "bg-purple-500/20 hover:bg-purple-500/40 border-purple-400/40 text-purple-300"
                      : "bg-purple-100 hover:bg-purple-200 border-purple-200 text-purple-700"
                }`}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArchivedNotes;
