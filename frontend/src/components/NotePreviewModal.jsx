import { formatDistanceToNow } from "date-fns";
import { toast } from "react-hot-toast";

const NotePreviewModal = ({
  note,
  isDarkMode = true,
  onClose,
  onEdit,
  onShare,
  onDelete,
  onArchive,
  onFavorite,
}) => {
  if (!note) return null;

  const handleCopyContent = () => {
    navigator.clipboard.writeText(note.text);
    toast.success("Copied to clipboard! ✨");
  };

  const readingTime = Math.max(1, Math.ceil(note.wordCount / 200));

  return (
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
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2
              className={`text-2xl font-bold mb-2 line-clamp-2 transition-colors duration-500 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {note.text.substring(0, 50)}...
            </h2>
            <div
              className={`flex items-center gap-4 text-sm transition-colors duration-500 ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              <span>
                📅{" "}
                {new Date(note.createdAt).toLocaleDateString("en-US", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span>📝 {note.wordCount} words</span>
              <span>⏱️ ~{readingTime} min read</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`text-2xl transition-colors ${
              isDarkMode
                ? "text-gray-400 hover:text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            ×
          </button>
        </div>

        {/* Category Badge */}
        {note.categoryId && (
          <div className="mb-6">
            <span
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium border transition-colors duration-500 ${
                isDarkMode
                  ? "bg-white/15 border-white/25 text-gray-200"
                  : "bg-gray-100 border-gray-300 text-gray-700"
              }`}
            >
              <span className="text-base">{note.categoryId.icon}</span>
              {note.categoryId.name}
            </span>
          </div>
        )}

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {note.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className={`px-3 py-1 rounded-lg text-sm transition-all duration-200 border ${
                    isDarkMode
                      ? "bg-white/10 border-white/15 text-gray-300 hover:bg-white/15"
                      : "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        <div
          className={`h-px mb-6 transition-colors duration-500 ${
            isDarkMode
              ? "bg-gradient-to-r from-blue-500/0 via-blue-400/20 to-purple-500/0"
              : "bg-gradient-to-r from-blue-500/0 via-blue-400/10 to-purple-500/0"
          }`}
        ></div>

        {/* Content */}
        <div className="mb-6">
          <h3
            className={`text-sm font-semibold mb-3 uppercase tracking-wider transition-colors duration-500 ${
              isDarkMode ? "text-blue-300" : "text-blue-600"
            }`}
          >
            Content
          </h3>
          <div
            className={`rounded-2xl p-5 max-h-48 overflow-y-auto border transition-colors duration-500 ${
              isDarkMode
                ? "bg-white/5 border-white/10"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <p
              className={`leading-relaxed whitespace-pre-wrap break-words transition-colors duration-500 ${
                isDarkMode ? "text-gray-100" : "text-gray-900"
              }`}
            >
              {note.text}
            </p>
          </div>
          <button
            onClick={handleCopyContent}
            className="mt-2 px-3 py-1.5 text-sm bg-blue-500/20 hover:bg-blue-500/40 border border-blue-400/40 text-blue-300 hover:text-blue-200 font-semibold rounded-lg transition-all duration-200"
          >
            📋 Copy Content
          </button>
        </div>

        {/* Summary */}
        {note.summary && (
          <div className="mb-6">
            <h3
              className={`text-sm font-semibold mb-3 uppercase tracking-wider transition-colors duration-500 ${
                isDarkMode ? "text-blue-300" : "text-blue-600"
              }`}
            >
              ✨ AI Summary
            </h3>
            <div
              className={`backdrop-blur-sm border-l-4 rounded-2xl p-5 transition-colors duration-500 ${
                isDarkMode
                  ? "bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-400/60"
                  : "bg-gradient-to-br from-blue-50 to-purple-50 border-blue-300"
              }`}
            >
              <p
                className={`text-sm leading-relaxed transition-colors duration-500 ${
                  isDarkMode ? "text-gray-200" : "text-gray-700"
                }`}
              >
                {note.summary}
              </p>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div
          className={`mb-6 p-4 rounded-lg border transition-colors duration-500 ${
            isDarkMode
              ? "bg-white/5 border-white/10"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          <p
            className={`text-xs transition-colors duration-500 ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Last updated{" "}
            {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
          </p>
          {note.lastModifiedBy && (
            <p
              className={`text-xs transition-colors duration-500 ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              by {note.lastModifiedBy.username}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={onEdit}
            className="flex-1 min-w-[120px] bg-blue-500/20 hover:bg-blue-500/40 border border-blue-400/40 text-blue-300 hover:text-blue-200 font-semibold py-3 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2"
          >
            <span>✏️</span>
            Edit
          </button>
          <button
            onClick={onShare}
            className="flex-1 min-w-[120px] bg-purple-500/20 hover:bg-purple-500/40 border border-purple-400/40 text-purple-300 hover:text-purple-200 font-semibold py-3 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/20 active:scale-95 flex items-center justify-center gap-2"
          >
            <span>🔗</span>
            Share
          </button>
          <button
            onClick={onFavorite}
            className="flex-1 min-w-[120px] bg-yellow-500/20 hover:bg-yellow-500/40 border border-yellow-400/40 text-yellow-300 hover:text-yellow-200 font-semibold py-3 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-yellow-500/20 active:scale-95 flex items-center justify-center gap-2"
          >
            <span>{note.isFavorited ? "⭐" : "☆"}</span>
            {note.isFavorited ? "Favorited" : "Favorite"}
          </button>
          <button
            onClick={onArchive}
            className="flex-1 min-w-[120px] bg-gray-500/20 hover:bg-gray-500/40 border border-gray-400/40 text-gray-300 hover:text-gray-200 font-semibold py-3 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-gray-500/20 active:scale-95 flex items-center justify-center gap-2"
          >
            <span>📦</span>
            {note.isArchived ? "Unarchive" : "Archive"}
          </button>
          <button
            onClick={onDelete}
            className="flex-1 min-w-[120px] bg-red-500/20 hover:bg-red-500/40 border border-red-400/40 text-red-300 hover:text-red-200 font-semibold py-3 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-red-500/20 active:scale-95 flex items-center justify-center gap-2"
          >
            <span>🗑️</span>
            Delete
          </button>
        </div>

        {/* Close button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            className={`px-6 py-3 font-semibold rounded-xl transition-all duration-200 border ${
              isDarkMode
                ? "bg-gray-600/50 hover:bg-gray-600 border-gray-500/30 text-gray-300 hover:text-white"
                : "bg-gray-200 hover:bg-gray-300 border-gray-300 text-gray-900 hover:text-gray-900"
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotePreviewModal;
