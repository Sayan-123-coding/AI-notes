import { useState } from "react";
import { toast } from "react-hot-toast";

const KeyboardShortcutsHelp = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const shortcuts = [
    {
      category: "Navigation",
      items: [
        { keys: "Ctrl + K", description: "Focus search bar" },
        { keys: "Ctrl + Shift + S", description: "Share first note" },
        { keys: "?", description: "Open this help dialog" },
      ],
    },
    {
      category: "Note Actions",
      items: [
        { keys: "Ctrl + N", description: "Create new note" },
        { keys: "Ctrl + E", description: "Edit selected note" },
        { keys: "Ctrl + D", description: "Duplicate selected note" },
      ],
    },
    {
      category: "UI",
      items: [
        { keys: "Ctrl + Shift + D", description: "Toggle dark mode" },
        { keys: "Escape", description: "Close modal" },
      ],
    },
  ];

  const filteredShortcuts = shortcuts
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          item.keys.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    }))
    .filter((group) => group.items.length > 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/20 rounded-3xl p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">Keyboard Shortcuts</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ×
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search shortcuts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2 text-white placeholder-gray-400 outline-none focus:border-blue-300/70 focus:bg-white/10 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200 mb-6"
        />

        {/* Shortcuts list */}
        {filteredShortcuts.length > 0 ? (
          <div className="space-y-6">
            {filteredShortcuts.map((group, idx) => (
              <div key={idx}>
                <h4 className="text-sm font-semibold text-blue-300 mb-3 uppercase tracking-wider">
                  {group.category}
                </h4>
                <div className="space-y-2">
                  {group.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all duration-200"
                    >
                      <span className="text-gray-300">{item.description}</span>
                      <kbd className="px-3 py-1 bg-white/10 border border-white/20 rounded text-xs font-mono text-gray-400">
                        {item.keys}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">
              No shortcuts found matching "{searchTerm}"
            </p>
          </div>
        )}

        {/* Close button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-600/50 hover:bg-gray-600 border border-gray-500/30 text-gray-300 hover:text-white font-semibold rounded-xl transition-all duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsHelp;
