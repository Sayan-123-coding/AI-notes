import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [isDark] = useState(() => localStorage.getItem("darkMode") === "true");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (username.length < 3) {
      toast.error("Username must be at least 3 characters");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    const result = await register(username, email, password, confirmPassword);
    if (result.success) {
      toast.success(result.message || "Account created successfully! 🎉", { duration: 2000 });
      setTimeout(() => { navigate("/"); }, 600);
    } else {
      toast.error(result.message);
    }
  };

  const inputClass = isDark
    ? "bg-white/5 border-white/15 text-white placeholder-gray-400 focus:border-blue-400/70 focus:bg-white/10 focus:ring-2 focus:ring-blue-500/30"
    : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-300/30";

  const labelClass = `block text-xs font-semibold mb-2 tracking-widest uppercase ${isDark ? "text-blue-300" : "text-blue-600"}`;

  return (
    <div
      className={`min-h-screen relative overflow-hidden flex items-center justify-center py-8 ${
        isDark
          ? "bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950"
          : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
      }`}
    >
      {/* Decorative blobs */}
      <div className={`absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl animate-pulse ${isDark ? "bg-blue-500/30" : "bg-blue-300/40"}`}></div>
      <div className={`absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl animate-pulse delay-700 ${isDark ? "bg-purple-500/25" : "bg-indigo-300/35"}`}></div>
      <div className={`absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full blur-3xl ${isDark ? "bg-cyan-500/5" : "bg-sky-200/25"}`}></div>

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
            Join AI Notes
          </h1>
          <p className={`font-light text-sm ${isDark ? "text-gray-400" : "text-slate-500"}`}>
            Create an account to start taking smart notes
          </p>
        </div>

        {/* Register Card */}
        <div className="relative">
          {isDark && (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/40 to-purple-500/40 rounded-3xl blur-2xl opacity-0 hover:opacity-70 transition-all duration-500"></div>
          )}
          <div className={`relative rounded-3xl p-8 transition-all duration-300 ${
            isDark
              ? "bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl"
              : "bg-white border border-blue-100 shadow-xl shadow-blue-100/60"
          }`}>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div>
                <label className={labelClass}>Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  placeholder="Choose your username"
                  className={`w-full rounded-xl px-4 py-3 outline-none transition-all duration-300 disabled:opacity-50 border ${inputClass}`}
                />
              </div>

              {/* Email */}
              <div>
                <label className={labelClass}>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  placeholder="your@email.com"
                  className={`w-full rounded-xl px-4 py-3 outline-none transition-all duration-300 disabled:opacity-50 border ${inputClass}`}
                />
              </div>

              {/* Password */}
              <div>
                <label className={labelClass}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  placeholder="Min. 6 characters"
                  className={`w-full rounded-xl px-4 py-3 outline-none transition-all duration-300 disabled:opacity-50 border ${inputClass}`}
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className={labelClass}>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  placeholder="••••••••"
                  className={`w-full rounded-xl px-4 py-3 outline-none transition-all duration-300 disabled:opacity-50 border ${inputClass}`}
                />
              </div>

              {/* Register Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full mt-2 px-8 py-4 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-3 ${
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
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span className="text-xl">✨</span>
                    <span>Create Account</span>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className={`mt-6 pt-6 border-t ${isDark ? "border-white/10" : "border-slate-100"}`}>
              <p className={`text-sm text-center ${isDark ? "text-gray-400" : "text-slate-500"}`}>
                Already have an account?{" "}
                <Link
                  to="/login"
                  className={`font-semibold transition-colors ${isDark ? "text-blue-300 hover:text-blue-200" : "text-blue-600 hover:text-blue-700"}`}
                >
                  Sign in
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
    </div>
  );
};

export default Register;
