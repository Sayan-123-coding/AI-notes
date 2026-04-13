import { TrendingUp, Calendar, FileText, Zap } from "lucide-react";

const AnalyticsCard = ({
  icon: Icon,
  label,
  value,
  unit,
  isDarkMode,
  color = "blue",
}) => {
  const colorClasses = {
    blue: {
      dark: "bg-blue-500/20 border-blue-400/40",
      light: "bg-blue-50 border-blue-200",
      icon: "text-blue-400",
    },
    green: {
      dark: "bg-green-500/20 border-green-400/40",
      light: "bg-green-50 border-green-200",
      icon: "text-green-400",
    },
    purple: {
      dark: "bg-purple-500/20 border-purple-400/40",
      light: "bg-purple-50 border-purple-200",
      icon: "text-purple-400",
    },
    yellow: {
      dark: "bg-yellow-500/20 border-yellow-400/40",
      light: "bg-yellow-50 border-yellow-200",
      icon: "text-yellow-400",
    },
  };

  const scheme = colorClasses[color] || colorClasses.blue;

  return (
    <div
      className={`p-6 rounded-xl border transition-all hover:shadow-lg ${
        isDarkMode
          ? `${scheme.dark} border-white/10`
          : `${scheme.light} border-gray-200`
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p
            className={`text-sm font-medium mb-2 ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {label}
          </p>
          <p
            className={`text-3xl font-bold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {value}
            <span
              className={`text-sm ml-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              {unit}
            </span>
          </p>
        </div>
        <Icon size={32} className={scheme.icon} />
      </div>
    </div>
  );
};

const AnalyticsSection = ({ notes, isDarkMode }) => {
  // Calculate stats
  const totalNotes = notes.length;
  const totalCharacters = notes.reduce(
    (sum, n) => sum + (n.content?.length || 0),
    0,
  );
  const averageLength =
    totalNotes > 0 ? Math.round(totalCharacters / totalNotes) : 0;

  // Calculate this week
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const notesThisWeek = notes.filter(
    (n) => new Date(n.createdAt || Date.now()) > oneWeekAgo,
  ).length;

  // Find most productive day (mock data - would be enhanced with real tracking)
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const randomDay = days[Math.floor(Math.random() * days.length)];

  return (
    <div className="space-y-6">
      <div>
        <h2
          className={`text-2xl font-bold mb-4 flex items-center gap-3 ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          <TrendingUp className="text-blue-400" />
          Analytics Overview
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AnalyticsCard
          icon={FileText}
          label="Total Notes"
          value={totalNotes}
          unit="notes"
          isDarkMode={isDarkMode}
          color="blue"
        />
        <AnalyticsCard
          icon={Calendar}
          label="This Week"
          value={notesThisWeek}
          unit="notes"
          isDarkMode={isDarkMode}
          color="green"
        />
        <AnalyticsCard
          icon={Zap}
          label="Total Characters"
          value={
            totalCharacters > 1000000
              ? (totalCharacters / 1000000).toFixed(1) + "M"
              : totalCharacters > 1000
                ? (totalCharacters / 1000).toFixed(1) + "K"
                : totalCharacters
          }
          unit=""
          isDarkMode={isDarkMode}
          color="purple"
        />
        <AnalyticsCard
          icon={TrendingUp}
          label="Avg. Note Length"
          value={averageLength}
          unit="chars"
          isDarkMode={isDarkMode}
          color="yellow"
        />
      </div>

      <div
        className={`p-6 rounded-xl border ${
          isDarkMode
            ? "bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-white/10"
            : "bg-gradient-to-br from-blue-50 to-purple-50 border-gray-200"
        }`}
      >
        <p
          className={`text-sm ${
            isDarkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          <span className="font-semibold">💡 Tip:</span> Keep writing! The more
          notes you create, the better insights you'll get. Your analytics will
          improve as your library grows.
        </p>
      </div>
    </div>
  );
};

export default AnalyticsSection;
