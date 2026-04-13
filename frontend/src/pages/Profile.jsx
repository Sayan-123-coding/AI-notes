import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Mail, User, Calendar, BarChart3 } from "lucide-react";
import { toast } from "react-hot-toast";
import AnalyticsSection from "../components/AnalyticsSection";

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem("darkMode") === "true",
  );
  const [stats, setStats] = useState({
    totalNotes: 0,
    totalFavorites: 0,
    totalArchived: 0,
  });
  const [notes, setNotes] = useState([]);
  const [joinDate, setJoinDate] = useState("");

  // Fetch user stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch(`${API_URL}/notes?limit=1000`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          const allNotes = data.data;
          setNotes(allNotes);
          setStats({
            totalNotes: allNotes.length,
            totalFavorites: allNotes.filter((n) => n.isFavorited).length,
            totalArchived: allNotes.filter((n) => n.isArchived).length,
          });
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };

    if (user?.createdAt) {
      setJoinDate(
        new Date(user.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      );
    }

    fetchStats();
  }, [user]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully", { duration: 2000 });
    setTimeout(() => {
      navigate("/login");
    }, 600);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        isDarkMode
          ? "bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950"
          : "bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50"
      }`}
    >
      {/* Header with Back Button */}
      <div
        className={`border-b transition-colors duration-500 ${
          isDarkMode
            ? "border-white/10 bg-slate-900/50"
            : "border-gray-300 bg-gray-50/50"
        }`}
      >
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                isDarkMode
                  ? "bg-white/10 hover:bg-white/20 text-blue-300 hover:text-blue-200 border border-white/20"
                  : "bg-blue-100 hover:bg-blue-200 text-blue-700 hover:text-blue-800 border border-blue-200"
              }`}
              title="Go back to notes"
            >
              <ArrowLeft size={18} />
              Back to Notes
            </button>
            <h1
              className={`text-3xl font-bold transition-colors duration-500 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              My Profile
            </h1>
            <div className="w-32"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Card */}
        <div
          className={`rounded-3xl backdrop-blur-2xl shadow-2xl overflow-hidden border transition-colors duration-500 ${
            isDarkMode
              ? "bg-white/10 border-white/20"
              : "bg-white border-gray-200"
          }`}
        >
          {/* Header Background */}
          <div className="h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

          {/* Content */}
          <div className="px-8 pb-8">
            {/* Avatar and Name */}
            <div className="flex flex-col items-center -mt-20 mb-8">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold text-5xl shadow-2xl border-4 border-white/20 mb-4">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <h2
                className={`text-3xl font-bold transition-colors duration-500 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {user?.username}
              </h2>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Email */}
              <div
                className={`p-6 rounded-2xl border transition-colors duration-500 ${
                  isDarkMode
                    ? "bg-white/5 border-white/10 hover:bg-white/10"
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`p-3 rounded-lg transition-colors duration-500 ${
                      isDarkMode ? "bg-blue-500/20" : "bg-blue-100"
                    }`}
                  >
                    <Mail
                      className={isDarkMode ? "text-blue-400" : "text-blue-600"}
                      size={20}
                    />
                  </div>
                  <h3
                    className={`font-semibold transition-colors duration-500 ${
                      isDarkMode ? "text-gray-300" : "text-gray-900"
                    }`}
                  >
                    Email
                  </h3>
                </div>
                <p
                  className={`text-sm break-all transition-colors duration-500 ${
                    isDarkMode ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  {user?.email}
                </p>
              </div>

              {/* User ID */}
              <div
                className={`p-6 rounded-2xl border transition-colors duration-500 ${
                  isDarkMode
                    ? "bg-white/5 border-white/10 hover:bg-white/10"
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`p-3 rounded-lg transition-colors duration-500 ${
                      isDarkMode ? "bg-purple-500/20" : "bg-purple-100"
                    }`}
                  >
                    <User
                      className={
                        isDarkMode ? "text-purple-400" : "text-purple-600"
                      }
                      size={20}
                    />
                  </div>
                  <h3
                    className={`font-semibold transition-colors duration-500 ${
                      isDarkMode ? "text-gray-300" : "text-gray-900"
                    }`}
                  >
                    User ID
                  </h3>
                </div>
                <p
                  className={`text-sm font-mono break-all transition-colors duration-500 ${
                    isDarkMode ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  {user?._id}
                </p>
              </div>

              {/* Join Date */}
              <div
                className={`p-6 rounded-2xl border transition-colors duration-500 ${
                  isDarkMode
                    ? "bg-white/5 border-white/10 hover:bg-white/10"
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`p-3 rounded-lg transition-colors duration-500 ${
                      isDarkMode ? "bg-green-500/20" : "bg-green-100"
                    }`}
                  >
                    <Calendar
                      className={
                        isDarkMode ? "text-green-400" : "text-green-600"
                      }
                      size={20}
                    />
                  </div>
                  <h3
                    className={`font-semibold transition-colors duration-500 ${
                      isDarkMode ? "text-gray-300" : "text-gray-900"
                    }`}
                  >
                    Member Since
                  </h3>
                </div>
                <p
                  className={`text-sm transition-colors duration-500 ${
                    isDarkMode ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  {joinDate}
                </p>
              </div>

              {/* Account Status */}
              <div
                className={`p-6 rounded-2xl border transition-colors duration-500 ${
                  isDarkMode
                    ? "bg-white/5 border-white/10 hover:bg-white/10"
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`p-3 rounded-lg transition-colors duration-500 ${
                      isDarkMode ? "bg-cyan-500/20" : "bg-cyan-100"
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-green-500"></div>
                  </div>
                  <h3
                    className={`font-semibold transition-colors duration-500 ${
                      isDarkMode ? "text-gray-300" : "text-gray-900"
                    }`}
                  >
                    Status
                  </h3>
                </div>
                <p
                  className={`text-sm transition-colors duration-500 ${
                    isDarkMode ? "text-green-300" : "text-green-600"
                  }`}
                >
                  Active ✓
                </p>
              </div>
            </div>

            {/* Stats Section */}
            <div
              className={`border-t transition-colors duration-500 pt-8 mb-8 ${
                isDarkMode ? "border-white/10" : "border-gray-300/10"
              }`}
            >
              <div className="flex items-center gap-2 mb-6">
                <BarChart3
                  className={isDarkMode ? "text-blue-400" : "text-blue-600"}
                  size={24}
                />
                <h3
                  className={`text-xl font-bold transition-colors duration-500 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Your Statistics
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div
                  className={`p-4 rounded-lg text-center border transition-colors duration-500 ${
                    isDarkMode
                      ? "bg-blue-500/10 border-blue-400/30 hover:bg-blue-500/20"
                      : "bg-blue-500/5 border-blue-400/20 hover:bg-blue-500/10"
                  }`}
                >
                  <div
                    className={`text-3xl font-bold mb-2 transition-colors duration-500 ${
                      isDarkMode ? "text-blue-400" : "text-blue-600"
                    }`}
                  >
                    {stats.totalNotes}
                  </div>
                  <p
                    className={`text-xs transition-colors duration-500 ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Total Notes
                  </p>
                </div>

                <div
                  className={`p-4 rounded-lg text-center border transition-colors duration-500 ${
                    isDarkMode
                      ? "bg-yellow-500/10 border-yellow-400/30 hover:bg-yellow-500/20"
                      : "bg-yellow-500/5 border-yellow-400/20 hover:bg-yellow-500/10"
                  }`}
                >
                  <div
                    className={`text-3xl font-bold mb-2 transition-colors duration-500 ${
                      isDarkMode ? "text-yellow-400" : "text-yellow-600"
                    }`}
                  >
                    {stats.totalFavorites}
                  </div>
                  <p
                    className={`text-xs transition-colors duration-500 ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Favorites
                  </p>
                </div>

                <div
                  className={`p-4 rounded-lg text-center border transition-colors duration-500 ${
                    isDarkMode
                      ? "bg-orange-500/10 border-orange-400/30 hover:bg-orange-500/20"
                      : "bg-orange-500/5 border-orange-400/20 hover:bg-orange-500/10"
                  }`}
                >
                  <div
                    className={`text-3xl font-bold mb-2 transition-colors duration-500 ${
                      isDarkMode ? "text-orange-400" : "text-orange-600"
                    }`}
                  >
                    {stats.totalArchived}
                  </div>
                  <p
                    className={`text-xs transition-colors duration-500 ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Archived
                  </p>
                </div>
              </div>
            </div>

            {/* Analytics Section */}
            <div className="mb-8">
              <AnalyticsSection notes={notes} isDarkMode={isDarkMode} />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/")}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  isDarkMode
                    ? "bg-blue-500/20 hover:bg-blue-500/40 border border-blue-400/40 text-blue-300 hover:text-blue-200"
                    : "bg-blue-500/10 hover:bg-blue-500/20 border border-blue-400/20 text-blue-700 hover:text-blue-600"
                }`}
              >
                Back to Notes
              </button>
              <button
                onClick={handleLogout}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  isDarkMode
                    ? "bg-red-500/20 hover:bg-red-500/40 border border-red-400/40 text-red-300 hover:text-red-200"
                    : "bg-red-500/10 hover:bg-red-500/20 border border-red-400/20 text-red-700 hover:text-red-600"
                }`}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
