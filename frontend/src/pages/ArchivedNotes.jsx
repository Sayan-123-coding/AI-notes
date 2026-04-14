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
      const res = await fetch(
        `${API_URL}/notes/${noteId}/archive`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/25 rounded-full blur-3xl animate-pulse delay-700"></div>

      {/* Content */}
      <div className="relative z-10 min-h-screen px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/40 border border-blue-400/40 text-blue-300 hover:text-blue-200 font-semibold rounded-lg transition-all duration-200"
            >
              ← Back to Notes
            </button>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-300 via-cyan-300 to-purple-300 bg-clip-text text-transparent">
              Archived Notes
            </h1>
            <p className="text-gray-400">
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
                  className="group relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-6 sm:p-8 hover:bg-white/15 hover:border-blue-400/50 transition-all duration-300"
                >
                  {/* Category */}
                  {note.categoryId && (
                    <div className="mb-3">
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 border border-white/25 rounded-lg text-sm font-medium text-gray-200">
                        <span>{note.categoryId.icon}</span>
                        {note.categoryId.name}
                      </span>
                    </div>
                  )}

                  {/* Content Preview */}
                  <p className="text-gray-100 leading-relaxed mb-4 line-clamp-3">
                    {note.text}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                    <span>
                      📅 {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                    <span>📝 {note.wordCount} words</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleUnarchive(note._id)}
                      className="flex-1 bg-blue-500/20 hover:bg-blue-500/40 border border-blue-400/40 text-blue-300 hover:text-blue-200 font-semibold py-2 rounded-lg text-sm transition-all duration-200"
                    >
                      📂 Unarchive
                    </button>
                    <button
                      onClick={() => handleDelete(note._id)}
                      className="flex-1 bg-red-500/20 hover:bg-red-500/40 border border-red-400/40 text-red-300 hover:text-red-200 font-semibold py-2 rounded-lg text-sm transition-all duration-200"
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
                className="px-6 py-3 bg-blue-500/20 hover:bg-blue-500/40 border border-blue-400/40 text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold"
              >
                ← Previous
              </button>
              <span className="text-gray-400">
                Page {page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => {
                  setPage(page + 1);
                  fetchArchivedNotes(search, page + 1);
                }}
                disabled={!pagination.hasNextPage || loading}
                className="px-6 py-3 bg-purple-500/20 hover:bg-purple-500/40 border border-purple-400/40 text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold"
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
