const BulkActionsBar = ({
  isVisible,
  selectedCount,
  onSelectAll,
  onClearSelection,
  onBulkArchive,
  onBulkDelete,
  onBulkFavorite,
  totalCount,
  isLoading,
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 to-slate-900/95 border-t border-white/20 backdrop-blur-lg z-40 p-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Info */}
        <div className="flex items-center gap-4">
          <div className="text-white font-semibold">
            {selectedCount} selected
            {totalCount > 0 && (
              <span className="text-gray-400 ml-2">of {totalCount}</span>
            )}
          </div>
          {selectedCount < totalCount && (
            <button
              onClick={onSelectAll}
              className="text-sm text-blue-400 hover:text-blue-300 underline transition-colors"
            >
              Select all
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBulkArchive}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/40 border border-blue-400/40 text-blue-300 hover:text-blue-200 font-semibold rounded-lg text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span>📦</span>
            Archive
          </button>

          <button
            onClick={onBulkFavorite}
            disabled={isLoading}
            className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/40 border border-yellow-400/40 text-yellow-300 hover:text-yellow-200 font-semibold rounded-lg text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span>⭐</span>
            Favorite
          </button>

          <button
            onClick={onBulkDelete}
            disabled={isLoading}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/40 border border-red-400/40 text-red-300 hover:text-red-200 font-semibold rounded-lg text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span>🗑️</span>
            Delete
          </button>

          <button
            onClick={onClearSelection}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-600/50 hover:bg-gray-600 border border-gray-500/30 text-gray-300 hover:text-white font-semibold rounded-lg text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkActionsBar;
