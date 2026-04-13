import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import TagManager from "../components/TagManager";

const TagsManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTagManager, setShowTagManager] = useState(false);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("http://localhost:5000/api/tags", {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/25 rounded-full blur-3xl animate-pulse delay-700"></div>

      {/* Content */}
      <div className="relative z-10 min-h-screen px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/40 border border-blue-400/40 text-blue-300 hover:text-blue-200 font-semibold rounded-lg transition-all duration-200"
            >
              ← Back to Notes
            </button>
          </div>

          <div className="text-center mb-12">
            <div className="mb-4">
              <span className="text-5xl">🏷️</span>
            </div>
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-300 via-cyan-300 to-purple-300 bg-clip-text text-transparent">
              Manage Tags
            </h1>
            <p className="text-gray-400">
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
                  className="bg-white/10 border border-white/20 rounded-2xl p-6 animate-pulse h-32"
                />
              ))}
            </div>
          ) : tags.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🏷️</div>
              <h3 className="text-2xl font-bold text-white mb-2">
                No Tags Yet
              </h3>
              <p className="text-gray-400 max-w-sm mx-auto mb-6">
                Create your first tag to organize your notes by theme, topic, or
                project.
              </p>
              <button
                onClick={() => setShowTagManager(true)}
                className="px-6 py-3 bg-blue-500/20 hover:bg-blue-500/40 border border-blue-400/40 text-blue-300 hover:text-blue-200 font-semibold rounded-xl transition-all duration-200"
              >
                Create First Tag
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tags.map((tag) => (
                <div
                  key={tag._id}
                  className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 hover:border-blue-400/50 transition-all duration-300"
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
                      className="px-3 py-1 bg-white/10 rounded-lg text-xs font-semibold text-gray-300"
                      title="Color code"
                    >
                      {tag.color}
                    </span>
                  </div>

                  {/* Tag name */}
                  <h3 className="text-lg font-bold text-white mb-4">
                    {tag.name}
                  </h3>

                  {/* Usage stats */}
                  {tag.usageCount !== undefined && (
                    <div className="flex items-center justify-between mb-4 p-3 bg-white/5 border border-white/10 rounded-lg">
                      <span className="text-sm text-gray-300">Used in</span>
                      <span className="text-lg font-bold text-blue-300">
                        {tag.usageCount} note{tag.usageCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  )}

                  {/* Meta */}
                  <p className="text-xs text-gray-400 mb-4">
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
                        fetch(`http://localhost:5000/api/tags/${tag._id}`, {
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
          <div className="mt-16 pt-8 border-t border-white/10 text-center">
            <p className="text-gray-400 text-sm">
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
