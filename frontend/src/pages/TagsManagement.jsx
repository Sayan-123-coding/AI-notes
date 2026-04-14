import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import TagManager from "../components/TagManager";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const TagsManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTagManager, setShowTagManager] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem("darkMode") === "true",
  );

  const fetchTags = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_URL}/tags`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        setTags(data.data);
      } else {
        toast.error("Failed to load tags");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading tags");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleTagCreated = (newTag) => {
    setTags([newTag, ...tags]);
  };

  const handleTagDeleted = (tagId) => {
    setTags(tags.filter((t) => t._id !== tagId));
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
        <div className="max-w-4xl mx-auto">
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

          <div className="text-center mb-12">
            <div className="mb-4">
              <span className="text-5xl">🏷️</span>
            </div>
            <h1
              className={`text-5xl font-bold mb-3 pb-2 ${
                isDarkMode
                  ? "bg-gradient-to-r from-blue-300 via-cyan-300 to-purple-300 bg-clip-text text-transparent"
                  : "text-slate-800"
              }`}
            >
              Manage Tags
            </h1>
            <p className={isDarkMode ? "text-gray-400" : "text-slate-500"}>
              Organize your notes with custom tags
            </p>
          </div>

          {/* Create tag button */}
          <div className="mb-12 text-center">
            <button
              onClick={() => setShowTagManager(true)}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white border border-blue-400/40 hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105 active:scale-95 font-semibold rounded-xl transition-all duration-300 flex items-center gap-3 mx-auto"
            >
              <span className="text-xl">➕</span>
              Create New Tag
            </button>
          </div>

          {/* Tags Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className={`border rounded-2xl p-6 animate-pulse h-32 ${
                    isDarkMode
                      ? "bg-white/10 border-white/20"
                      : "bg-gray-100 border-gray-200"
                  }`}
                />
              ))}
            </div>
          ) : tags.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🏷️</div>
              <h3
                className={`text-2xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-slate-800"}`}
              >
                No Tags Yet
              </h3>
              <p
                className={`max-w-sm mx-auto mb-6 ${isDarkMode ? "text-gray-400" : "text-slate-500"}`}
              >
                Create your first tag to organize your notes by theme, topic, or
                project.
              </p>
              <button
                onClick={() => setShowTagManager(true)}
                className={`px-6 py-3 font-semibold rounded-xl transition-all duration-200 border ${
                  isDarkMode
                    ? "bg-blue-500/20 hover:bg-blue-500/40 border-blue-400/40 text-blue-300 hover:text-blue-200"
                    : "bg-blue-100 hover:bg-blue-200 border-blue-200 text-blue-700 hover:text-blue-800"
                }`}
              >
                Create First Tag
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tags.map((tag) => (
                <div
                  key={tag._id}
                  className={`backdrop-blur-2xl border rounded-2xl p-6 transition-all duration-300 ${
                    isDarkMode
                      ? "bg-white/10 border-white/20 hover:bg-white/15 hover:border-blue-400/50"
                      : "bg-white border-gray-200 shadow-lg hover:shadow-xl hover:border-blue-300"
                  }`}
                >
                  {/* Tag header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span
                        className="w-6 h-6 rounded-lg"
                        style={{ backgroundColor: tag.color }}
                        title={tag.color}
                      ></span>
                      <span className="text-2xl">{tag.icon}</span>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                        isDarkMode
                          ? "bg-white/10 text-gray-300"
                          : "bg-gray-100 text-slate-500"
                      }`}
                      title="Color code"
                    >
                      {tag.color}
                    </span>
                  </div>

                  {/* Tag name */}
                  <h3
                    className={`text-lg font-bold mb-4 ${isDarkMode ? "text-white" : "text-slate-800"}`}
                  >
                    {tag.name}
                  </h3>

                  {/* Usage stats */}
                  {tag.usageCount !== undefined && (
                    <div
                      className={`flex items-center justify-between mb-4 p-3 border rounded-lg ${
                        isDarkMode
                          ? "bg-white/5 border-white/10"
                          : "bg-gray-50 border-gray-100"
                      }`}
                    >
                      <span
                        className={`text-sm ${isDarkMode ? "text-gray-300" : "text-slate-500"}`}
                      >
                        Used in
                      </span>
                      <span
                        className={`text-lg font-bold ${isDarkMode ? "text-blue-300" : "text-blue-600"}`}
                      >
                        {tag.usageCount} note{tag.usageCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  )}

                  {/* Meta */}
                  <p
                    className={`text-xs mb-4 ${isDarkMode ? "text-gray-400" : "text-slate-500"}`}
                  >
                    Created {new Date(tag.createdAt).toLocaleDateString()}
                  </p>

                  {/* Action button */}
                  <button
                    onClick={() => {
                      const confirmed = window.confirm(
                        "Delete this tag? It will be removed from all notes.",
                      );
                      if (confirmed) {
                        // Call delete API here
                        fetch(`${API_URL}/tags/${tag._id}`, {
                          method: "DELETE",
                          headers: {
                            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                          },
                        })
                          .then((r) => r.json())
                          .then((data) => {
                            if (data.success) {
                              setTags(tags.filter((t) => t._id !== tag._id));
                              toast.success("Tag deleted! 🗑️");
                            } else {
                              toast.error(
                                data.message || "Failed to delete tag",
                              );
                            }
                          })
                          .catch((err) => {
                            console.error(err);
                            toast.error("Error deleting tag");
                          });
                      }
                    }}
                    className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/40 border border-red-400/40 text-red-300 hover:text-red-200 font-semibold rounded-lg text-sm transition-all duration-200"
                  >
                    🗑️ Delete Tag
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div
            className={`mt-16 pt-8 border-t text-center ${
              isDarkMode ? "border-white/10" : "border-gray-200"
            }`}
          >
            <p className={isDarkMode ? "text-gray-400" : "text-slate-500"}>
              {tags.length} tag{tags.length !== 1 ? "s" : ""} created
            </p>
          </div>
        </div>
      </div>

      {/* Tag Manager Modal */}
      <TagManager
        isOpen={showTagManager}
        onClose={() => {
          setShowTagManager(false);
          fetchTags(); // Refresh tags
        }}
        tags={tags}
        onTagCreated={handleTagCreated}
        onTagDeleted={handleTagDeleted}
      />
    </div>
  );
};

export default TagsManagement;
