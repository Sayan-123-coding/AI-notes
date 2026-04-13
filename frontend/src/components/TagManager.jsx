import { useState } from "react";
import { toast } from "react-hot-toast";

const TagManager = ({
  isOpen,
  onClose,
  tags = [],
  onTagCreated,
  onTagDeleted,
  isLoading = false,
}) => {
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#6366f1");
  const [newTagIcon, setNewTagIcon] = useState("🏷️");

  if (!isOpen) return null;

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      toast.error("Tag name is required");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          name: newTagName.trim(),
          color: newTagColor,
          icon: newTagIcon,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Tag created successfully! ✨");
        if (onTagCreated) onTagCreated(data.data);
        setNewTagName("");
        setNewTagColor("#6366f1");
        setNewTagIcon("🏷️");
      } else {
        toast.error(data.message || "Failed to create tag");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error creating tag");
    }
  };

  const handleDeleteTag = async (tagId) => {
    if (!window.confirm("Delete this tag? It will be removed from all notes."))
      return;

    try {
      const response = await fetch(`http://localhost:5000/api/tags/${tagId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Tag deleted! 🗑️");
        if (onTagDeleted) onTagDeleted(tagId);
      } else {
        toast.error(data.message || "Failed to delete tag");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error deleting tag");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/20 rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-bold text-white mb-6">Manage Tags</h3>

        {/* Create new tag */}
        <div className="mb-8 p-6 bg-white/5 border border-white/10 rounded-2xl">
          <h4 className="text-sm font-semibold text-gray-300 mb-4">
            Create New Tag
          </h4>

          {/* Tag name input */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-400 mb-2">
              Tag Name
            </label>
            <input
              type="text"
              maxLength="20"
              placeholder="e.g., Work, Ideas..."
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              disabled={isLoading}
              className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-2 text-white placeholder-gray-400 outline-none focus:border-blue-300/70 focus:bg-white/10 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200"
            />
          </div>

          {/* Color selector */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-400 mb-2">
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
                "#6366f1",
              ].map((color) => (
                <button
                  key={color}
                  onClick={() => setNewTagColor(color)}
                  className={`h-8 rounded-lg border-2 transition-all duration-200 ${
                    newTagColor === color
                      ? "border-white shadow-lg scale-110"
                      : "border-white/20 hover:border-white/40"
                  }`}
                  style={{ backgroundColor: color }}
                  disabled={isLoading}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Icon picker */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-400 mb-2">
              Icon
            </label>
            <div className="grid grid-cols-8 gap-2">
              {[
                "🏷️",
                "📌",
                "⭐",
                "💡",
                "🎯",
                "📚",
                "🔥",
                "✅",
                "🚀",
                "💎",
                "🌟",
                "⚡",
                "📍",
                "🎨",
                "💼",
                "📝",
              ].map((icon) => (
                <button
                  key={icon}
                  onClick={() => setNewTagIcon(icon)}
                  className={`h-8 flex items-center justify-center text-lg rounded-lg border-2 transition-all duration-200 ${
                    newTagIcon === icon
                      ? "border-white bg-white/20 scale-110"
                      : "border-white/20 hover:border-white/40 hover:bg-white/10"
                  }`}
                  disabled={isLoading}
                  title={icon}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Create button */}
          <button
            onClick={handleCreateTag}
            disabled={isLoading || !newTagName.trim()}
            className={`w-full py-2 font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
              isLoading || !newTagName.trim()
                ? "bg-gray-600/50 cursor-not-allowed text-gray-300 border border-gray-500/30"
                : "bg-gradient-to-r from-blue-500 to-purple-600 text-white border border-blue-400/40 hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105 active:scale-95"
            }`}
          >
            <span>➕</span>
            Create Tag
          </button>
        </div>

        {/* Existing tags */}
        {tags && tags.length > 0 ? (
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-4">
              Your Tags ({tags.length})
            </h4>
            <div className="space-y-2">
              {tags.map((tag) => (
                <div
                  key={tag._id}
                  className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: tag.color }}
                      title={tag.color}
                    ></span>
                    <span className="text-lg">{tag.icon}</span>
                    <div>
                      <p className="text-white font-medium">{tag.name}</p>
                      {tag.usageCount !== undefined && (
                        <p className="text-gray-400 text-sm">
                          {tag.usageCount} note{tag.usageCount !== 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteTag(tag._id)}
                    disabled={isLoading}
                    className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/40 border border-red-400/40 hover:border-red-400/70 text-red-300 hover:text-red-200 font-semibold rounded-lg text-sm transition-all duration-200 disabled:cursor-not-allowed"
                    title="Delete tag"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">No tags yet. Create one above! ➕</p>
          </div>
        )}

        {/* Close button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-3 bg-gray-600/50 hover:bg-gray-600 border border-gray-500/30 text-gray-300 hover:text-white font-semibold rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TagManager;
