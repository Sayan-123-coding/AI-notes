import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const SharedNotes = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("date");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const debounceTimer = useRef(null);
  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem("darkMode") === "true",
  );

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully", { duration: 2000 });
    setTimeout(() => {
      navigate("/login");
    }, 600);
  };

  // 🔥 FETCH SHARED NOTES
  const fetchSharedNotes = async (
    searchQuery = "",
    sortBy = "date",
    pageNum = 1,
  ) => {
    setIsFetching(true);
    try {
      const params = new URLSearchParams({
        search: searchQuery,
        sort: sortBy,
        page: pageNum,
        limit: 10,
      });

      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API_URL}/shares/shared-with-me?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        setNotes(data.data);
        setPagination(data.pagination);
      } else {
        toast.error("Failed to load shared notes");
      }
    } catch (err) {
      console.error("Error fetching shared notes:", err);
      toast.error("Error loading shared notes");
    } finally {
      setIsFetching(false);
    }
  };

  // Load on mount
  useEffect(() => {
    if (!user) navigate("/login");
    fetchSharedNotes("", "date", 1);
  }, []);

  // Debounced search handler
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearch(query);
    setPage(1);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchSharedNotes(query, sort, 1);
    }, 300);
  };

  // Sort handler
  const handleSort = (newSort) => {
    setSort(newSort);
    setPage(1);
    fetchSharedNotes(search, newSort, 1);
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (pagination?.hasNextPage) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchSharedNotes(search, sort, nextPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevPage = () => {
    if (pagination?.hasPrevPage) {
      const prevPage = page - 1;
      setPage(prevPage);
      fetchSharedNotes(search, sort, prevPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
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
      <Toaster />

      {/* Header Section */}
      <div
        className={`fixed top-0 left-0 right-0 z-40 backdrop-blur-xl border-b p-6 transition-colors duration-500 ${
          isDarkMode
            ? "bg-slate-950/95 border-b-white/10"
            : "bg-white/80 border-b-gray-200"
        }`}
      >
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <button
              onClick={() => navigate("/")}
              className={`flex items-center gap-1.5 px-3 py-2 sm:px-4 rounded-lg font-semibold transition-all duration-200 border ${
                isDarkMode
                  ? "bg-white/10 hover:bg-white/20 border-white/20 text-gray-300 hover:text-white"
                  : "bg-blue-100 hover:bg-blue-200 border-blue-200 text-blue-700 hover:text-blue-800"
              }`}
              title="Back to my notes"
            >
              <span>←</span>
              <span className="hidden md:inline">Back to My Notes</span>
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold text-sm">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={handleLogout}
              className={`px-6 py-3 font-semibold rounded-xl transition-all duration-200 hover:shadow-lg active:scale-95 flex items-center gap-2 border ${
                isDarkMode
                  ? "bg-red-500/20 hover:bg-red-500/40 border-red-400/40 text-red-300 hover:text-red-200 hover:shadow-red-500/20"
                  : "bg-red-50 hover:bg-red-100 border-red-200 text-red-600 hover:text-red-700 hover:shadow-red-500/10"
              }`}
            >
              <span className="text-lg">👋</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - With top padding for fixed header */}
      <div className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-16 animate-fade-in">
            <div className="mb-6 flex justify-center">
              <div className="text-7xl drop-shadow-lg">🤝</div>
            </div>
            <h1
              className={`text-6xl sm:text-7xl font-bold mb-4 tracking-tight pb-2 ${
                isDarkMode
                  ? "bg-gradient-to-r from-purple-300 via-pink-300 to-red-300 bg-clip-text text-transparent"
                  : "text-slate-800"
              }`}
            >
              Shared Notes
            </h1>
            <p
              className={`text-xl sm:text-2xl font-light tracking-wide max-w-2xl mx-auto mb-2 ${
                isDarkMode ? "text-gray-300" : "text-slate-500"
              }`}
            >
              Notes shared with you by others
            </p>
          </div>

          {/* Notes List Section */}
          <div>
            {/* Search, Sort Bar */}
            {notes.length > 0 || search ? (
              <div className="mb-10">
                {/* Heading with result count */}
                <div className="mb-8">
                  <h2
                    className={`text-4xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-slate-800"}`}
                  >
                    {search ? `Search Results: "${search}"` : "Shared with You"}
                  </h2>
                  <div className="h-1 w-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                  {pagination && (
                    <p
                      className={`text-sm mt-3 ${isDarkMode ? "text-gray-400" : "text-slate-500"}`}
                    >
                      Showing {notes.length} of {pagination.total} shared notes
                    </p>
                  )}
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="🔍 Search shared notes..."
                      value={search}
                      onChange={handleSearch}
                      disabled={isFetching}
                      className={`w-full border rounded-2xl px-6 py-3 placeholder-gray-400 outline-none focus:ring-2 transition-all duration-300 disabled:opacity-50 ${
                        isDarkMode
                          ? "bg-white/10 border-white/20 text-white focus:border-blue-300/70 focus:bg-white/15 focus:ring-blue-500/30"
                          : "bg-white border-gray-300 text-slate-800 focus:border-blue-500 focus:ring-blue-500/20"
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
                  </div>
                </div>

                {/* Sort Buttons */}
                <div className="flex flex-wrap gap-3 mb-8">
                  <span
                    className={`text-sm font-semibold self-center ${isDarkMode ? "text-gray-400" : "text-slate-500"}`}
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
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 disabled:opacity-50 border ${
                        sort === option.value
                          ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white border-purple-400/40 shadow-lg shadow-purple-500/30"
                          : isDarkMode
                            ? "bg-white/10 border-white/20 text-gray-300 hover:text-white hover:bg-white/15 hover:border-purple-400/40"
                            : "bg-white border-gray-300 text-slate-600 hover:text-slate-900 hover:bg-gray-50 hover:border-purple-500/40 shadow-sm"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mb-10">
                <h2
                  className={`text-4xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-slate-800"}`}
                >
                  No Shared Notes
                </h2>
                <div className="h-1 w-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
              </div>
            )}

            {notes.length === 0 ? (
              /* Empty State */
              <div className="grid place-items-center py-24">
                <div className="text-center">
                  <div
                    className={`inline-block mb-6 p-6 backdrop-blur-xl border rounded-3xl ${
                      isDarkMode
                        ? "bg-white/5 border-white/20"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <span className="text-6xl block">📭</span>
                  </div>
                  <h3
                    className={`text-3xl font-bold mb-3 ${isDarkMode ? "text-white" : "text-slate-800"}`}
                  >
                    {search ? "No Shared Notes Found" : "No Notes Shared Yet"}
                  </h3>
                  <p
                    className={`font-light text-lg max-w-sm mx-auto ${
                      isDarkMode ? "text-gray-400" : "text-slate-500"
                    }`}
                  >
                    {search ? (
                      <>Try a different search term.</>
                    ) : (
                      <>
                        When someone shares a note with you, it will appear
                        here.
                      </>
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 auto-rows-max">
                  {notes.map((n, index) => (
                    <div
                      key={n._id}
                      className="group relative animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {/* Card glow effect */}
                      {isDarkMode && (
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                      )}

                      {/* Glass Note Card */}
                      <div
                        className={`relative backdrop-blur-2xl border rounded-3xl p-7 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-1 h-full flex flex-col ${
                          isDarkMode
                            ? "bg-white/10 border-white/20 hover:bg-white/15 group-hover:border-purple-400/50"
                            : "bg-white/70 border-gray-200 hover:bg-white group-hover:border-purple-300 group-hover:shadow-purple-100/50"
                        }`}
                      >
                        {/* Shared by info */}
                        <div className="mb-4">
                          <div
                            className={`inline-block px-3 py-1 border rounded-lg text-xs font-medium ${
                              isDarkMode
                                ? "bg-white/10 border-white/20 text-gray-300"
                                : "bg-purple-50 border-purple-100 text-purple-700"
                            }`}
                          >
                            🤝 Shared by{" "}
                            <span
                              className={isDarkMode ? "text-purple-300" : "text-purple-900 font-bold"}
                            >
                              {n.sharedBy?.username}
                            </span>
                          </div>
                        </div>

                        {/* Note Text */}
                        <div className="mb-6 flex-1">
                          <p
                            className={`leading-relaxed text-base font-light ${
                              isDarkMode ? "text-gray-100" : "text-slate-700 font-normal"
                            }`}
                          >
                            {n.text}
                          </p>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-gradient-to-r from-purple-500/0 via-purple-400/20 to-pink-500/0 mb-6"></div>

                        {/* AI Summary Section */}
                        <div className="mb-6">
                          <div className="flex items-center gap-2 mb-4">
                            <span className="inline-block bg-gradient-to-r from-purple-400 to-pink-400 text-white text-xs font-bold px-3 py-1 rounded-full tracking-wider">
                              ✨ AI SUMMARY
                            </span>
                          </div>
                          <div
                            className={`backdrop-blur-sm border-l-4 rounded-2xl p-5 ${
                              isDarkMode
                                ? "bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-400/60"
                                : "bg-purple-50 border-purple-300"
                            }`}
                          >
                            <p
                              className={`text-sm leading-relaxed font-light ${
                                isDarkMode ? "text-gray-200" : "text-slate-600 font-normal"
                              }`}
                            >
                              {n.summary}
                            </p>
                          </div>
                        </div>

                        {/* Note Info */}
                        <div
                          className={`text-xs space-y-1 ${isDarkMode ? "text-gray-400" : "text-slate-500"}`}
                        >
                          <p>
                            Shared {new Date(n.sharedAt).toLocaleDateString()}
                          </p>
                          {n.categoryId && (
                            <p className={isDarkMode ? "text-purple-300" : "text-purple-600 font-semibold"}>
                              📁 {n.categoryId.name}
                            </p>
                          )}
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
                      className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 border ${
                        !pagination.hasPrevPage || isFetching
                          ? isDarkMode
                            ? "bg-gray-600/50 cursor-not-allowed text-gray-300 border-gray-500/30"
                            : "bg-gray-200 cursor-not-allowed text-gray-400 border-gray-300"
                          : isDarkMode
                            ? "bg-purple-500/20 hover:bg-purple-500/40 border-purple-400/40 text-purple-300 hover:text-purple-200 hover:shadow-lg hover:shadow-purple-500/20 active:scale-95"
                            : "bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700 hover:text-purple-800 shadow-sm active:scale-95"
                      }`}
                    >
                      ← Previous
                    </button>

                    <span
                      className={`font-semibold ${isDarkMode ? "text-gray-400" : "text-slate-600"}`}
                    >
                      Page {pagination.current} of {pagination.totalPages}
                    </span>

                    <button
                      onClick={handleNextPage}
                      disabled={!pagination.hasNextPage || isFetching}
                      className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 border ${
                        !pagination.hasNextPage || isFetching
                          ? isDarkMode
                            ? "bg-gray-600/50 cursor-not-allowed text-gray-300 border-gray-500/30"
                            : "bg-gray-200 cursor-not-allowed text-gray-400 border-gray-300"
                          : isDarkMode
                            ? "bg-purple-500/20 hover:bg-purple-500/40 border-purple-400/40 text-purple-300 hover:text-purple-200 hover:shadow-lg hover:shadow-purple-500/20 active:scale-95"
                            : "bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700 hover:text-purple-800 shadow-sm active:scale-95"
                      }`}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Animated gradient blobs */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-500/25 rounded-full blur-3xl animate-pulse delay-700"></div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; opacity: 0; }
        .delay-700 { animation-delay: 700ms; }
      `}</style>
    </div>
  );
};

export default SharedNotes;
