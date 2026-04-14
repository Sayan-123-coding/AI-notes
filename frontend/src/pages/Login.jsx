import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import ForgotPasswordModal from "../components/ForgotPasswordModal";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [isDark] = useState(() => localStorage.getItem("darkMode") === "true");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    const result = await login(email, password);
    if (result.success) {
      toast.success(result.message || "Login successful! Welcome back 🎉", { duration: 2000 });
      setTimeout(() => { navigate("/"); }, 600);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div
      className={`min-h-screen relative overflow-hidden flex items-center justify-center ${
        isDark
          ? "bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950"
          : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
      }`}
    >
      {/* Decorative blobs */}
      <div className={`absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl animate-pulse ${isDark ? "bg-blue-500/30" : "bg-blue-300/40"}`}></div>
      <div className={`absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl animate-pulse delay-700 ${isDark ? "bg-purple-500/25" : "bg-indigo-300/35"}`}></div>
      <div className={`absolute top-1/2 left-1/3 w-[500px] h-[500px] rounded-full blur-3xl ${isDark ? "bg-cyan-500/5" : "bg-sky-200/25"}`}></div>

      <div className="relative z-10 max-w-md w-full mx-4">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="mb-5 flex justify-center">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-xl ${
              isDark
                ? "bg-gradient-to-br from-blue-500 to-purple-600 shadow-blue-500/30"
                : "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-400/40"
            }`}>
              🧠
            </div>
          </div>
          <h1 className={`text-3xl sm:text-4xl font-bold mb-2 tracking-tight ${
            isDark
              ? "bg-gradient-to-r from-blue-300 via-cyan-300 to-purple-300 bg-clip-text text-transparent"
              : "text-slate-800"
          }`}>
            Welcome Back
          </h1>
          <p className={`font-light text-sm ${isDark ? "text-gray-400" : "text-slate-500"}`}>
            Sign in to continue your note-taking journey
          </p>
        </div>

        {/* Login Card */}
        <div className="relative">
          {isDark && (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/40 to-purple-500/40 rounded-3xl blur-2xl opacity-0 hover:opacity-70 transition-all duration-500"></div>
          )}
          <div className={`relative rounded-3xl p-8 transition-all duration-300 ${
            isDark
              ? "bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl"
              : "bg-white border border-blue-100 shadow-xl shadow-blue-100/60"
          }`}>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div>
                <label className={`block text-xs font-semibold mb-2 tracking-widest uppercase ${isDark ? "text-blue-300" : "text-blue-600"}`}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  placeholder="your@email.com"
                  className={`w-full rounded-xl px-4 py-3 outline-none transition-all duration-300 disabled:opacity-50 border ${
                    isDark
                      ? "bg-white/5 border-white/15 text-white placeholder-gray-400 focus:border-blue-400/70 focus:bg-white/10 focus:ring-2 focus:ring-blue-500/30"
                      : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-300/30"
                  }`}
                />
              </div>

              {/* Password Field */}
              <div>
                <label className={`block text-xs font-semibold mb-2 tracking-widest uppercase ${isDark ? "text-blue-300" : "text-blue-600"}`}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  placeholder="••••••••"
                  className={`w-full rounded-xl px-4 py-3 outline-none transition-all duration-300 disabled:opacity-50 border ${
                    isDark
                      ? "bg-white/5 border-white/15 text-white placeholder-gray-400 focus:border-blue-400/70 focus:bg-white/10 focus:ring-2 focus:ring-blue-500/30"
                      : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-300/30"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className={`mt-2 text-xs font-medium transition-colors ${isDark ? "text-blue-300 hover:text-blue-200" : "text-blue-500 hover:text-blue-700"}`}
                >
                  Forgot password?
                </button>
              </div>

              {/* Troubleshooting Tips */}
              <div className={`rounded-xl p-4 text-sm border ${
                isDark
                  ? "bg-white/5 border-white/15 text-gray-300"
                  : "bg-amber-50 border-amber-200 text-amber-800"
              }`}>
                <p className={`font-semibold mb-1.5 flex items-center gap-1.5 ${isDark ? "text-yellow-300" : "text-amber-700"}`}>
                  💡 Can't login?
                </p>
                <ul className="space-y-1 text-xs">
                  <li>• Try registering a new account if login fails</li>
                  <li>• Make sure your email and password are correct</li>
                  <li>• You can update your password from account settings</li>
                </ul>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full px-8 py-4 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-3 ${
                  loading
                    ? isDark
                      ? "bg-gray-600/50 cursor-not-allowed text-gray-300 border border-gray-500/30"
                      : "bg-slate-200 cursor-not-allowed text-slate-400"
                    : isDark
                    ? "bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 text-white border border-blue-400/40 hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-95 shadow-lg"
                    : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-400/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-95"
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span className="text-xl">🔓</span>
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className={`mt-6 pt-6 border-t ${isDark ? "border-white/10" : "border-slate-100"}`}>
              <p className={`text-sm text-center ${isDark ? "text-gray-400" : "text-slate-500"}`}>
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className={`font-semibold transition-colors ${isDark ? "text-blue-300 hover:text-blue-200" : "text-blue-600 hover:text-blue-700"}`}
                >
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; opacity: 0; }
        .delay-700 { animation-delay: 700ms; }
      `}</style>

      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        isDarkMode={isDark}
      />
    </div>
  );
};

export default Login;
