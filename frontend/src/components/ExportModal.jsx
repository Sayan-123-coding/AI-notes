import { useState } from "react";
import { toast } from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const ExportModal = ({
  isOpen,
  onClose,
  categories,
  tags,
  selectedCategory,
  selectedTags,
}) => {
  const [format, setFormat] = useState("json");
  const [filters, setFilters] = useState({
    categoryId: selectedCategory || "",
    tags: selectedTags?.join(",") || "",
    isFavorited: false,
  });
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      if (filters.categoryId) params.append("categoryId", filters.categoryId);
      if (filters.tags) params.append("tags", filters.tags);
      if (filters.isFavorited) params.append("isFavorited", "true");

      const response = await fetch(`${API_URL}/export/${format}?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const filename = {
        json: "notes-export.json",
        csv: "notes-export.csv",
        markdown: "notes-export.md",
      }[format];

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Exported as ${format.toUpperCase()}! 📥`);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to export notes");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/20 rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <h3 className="text-2xl font-bold text-white mb-6">Export Notes</h3>

        {/* Format Selection */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-300 mb-4">
            Export Format
          </label>
          <div className="space-y-3">
            {[
              { value: "json", label: "JSON", desc: "Complete data backup" },
              { value: "csv", label: "CSV", desc: "Spreadsheet compatible" },
              {
                value: "markdown",
                label: "Markdown",
                desc: "Readable text format",
              },
            ].map((opt) => (
              <label
                key={opt.value}
                className="flex items-center p-3 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-all duration-200"
              >
                <input
                  type="radio"
                  name="format"
                  value={opt.value}
                  checked={format === opt.value}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-4 h-4 text-blue-500"
                />
                <div className="ml-3 flex-1">
                  <p className="text-white font-medium">{opt.label}</p>
                  <p className="text-gray-400 text-xs">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-300 mb-3">
            Filter by (Optional)
          </label>
          <div className="space-y-3">
            {/* Category filter */}
            {categories.length > 0 && (
              <select
                value={filters.categoryId}
                onChange={(e) =>
                  setFilters({ ...filters, categoryId: e.target.value })
                }
                className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-300/70 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            )}

            {/* Favorites only */}
            <label className="flex items-center p-3 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-all duration-200">
              <input
                type="checkbox"
                checked={filters.isFavorited}
                onChange={(e) =>
                  setFilters({ ...filters, isFavorited: e.target.checked })
                }
                className="w-4 h-4 text-blue-500"
              />
              <span className="ml-3 text-white">Only Favorites ⭐</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="px-6 py-3 bg-gray-600/50 hover:bg-gray-600 border border-gray-500/30 text-gray-300 hover:text-white font-semibold rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className={`px-6 py-3 font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 ${
              isExporting
                ? "bg-gray-600/50 cursor-not-allowed text-gray-300 border border-gray-500/30"
                : "bg-gradient-to-r from-blue-500 to-purple-600 text-white border border-blue-400/40 hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105 active:scale-95"
            }`}
          >
            {isExporting ? (
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
                Exporting...
              </>
            ) : (
              <>
                <span>📥</span>
                Export
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
