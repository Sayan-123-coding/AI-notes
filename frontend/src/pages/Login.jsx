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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      toast.success(result.message || "Login successful! Welcome back 🎉", {
        duration: 2000,
      });
      // Delay navigation to allow toast to display
      setTimeout(() => {
        navigate("/");
      }, 600);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 relative overflow-hidden flex items-center justify-center">
      {/* Animated gradient blobs */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/25 rounded-full blur-3xl animate-pulse delay-700"></div>

      <div className="relative z-10 max-w-md w-full mx-4">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="mb-4 flex justify-center">
            <div className="text-4xl sm:text-5xl drop-shadow-lg">🧠</div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-300 via-cyan-300 to-purple-300 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-gray-400 font-light">
            Sign in to continue your note-taking journey
          </p>
        </div>

        {/* Login Card */}
        <div className="group relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/40 to-purple-500/40 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

          <div className="relative bg-white/10 backdrop-blur-2xl border border-white/25 rounded-3xl p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-blue-300 mb-3 tracking-wide uppercase">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  placeholder="your@email.com"
                  className="w-full bg-white/5 border border-white/15 rounded-2xl px-6 py-3 text-white placeholder-gray-400 outline-none focus:border-blue-300/70 focus:bg-white/10 focus:ring-2 focus:ring-blue-500/30 transition-all duration-300 disabled:opacity-50"
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-blue-300 mb-3 tracking-wide uppercase">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  placeholder="••••••"
                  className="w-full bg-white/5 border border-white/15 rounded-2xl px-6 py-3 text-white placeholder-gray-400 outline-none focus:border-blue-300/70 focus:bg-white/10 focus:ring-2 focus:ring-blue-500/30 transition-all duration-300 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="mt-2 text-sm text-blue-300 hover:text-blue-200 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Troubleshooting Tips */}
              <div className="bg-white/5 border border-white/15 rounded-xl p-4 text-sm text-gray-300">
                <p className="font-semibold text-yellow-300 mb-2">
                  💡 Can't login?
                </p>
                <ul className="space-y-1 text-xs">
                  <li>• Try registering a new account if login fails</li>
                  <li>• Make sure your email and password are correct</li>
                  <li>
                    • You can update your password from your account settings
                  </li>
                </ul>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full mt-8 px-8 py-4 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-3 ${
                  loading
                    ? "bg-gray-600/50 cursor-not-allowed text-gray-300 border border-gray-500/30"
                    : "bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 text-white border border-blue-400/40 hover:border-blue-300/60 hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-105 active:scale-95 shadow-lg"
                }`}
              >
                {loading ? (
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
            <div className="mt-8 pt-8 border-t border-white/10">
              <p className="text-gray-400 text-sm text-center">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-blue-300 hover:text-blue-200 font-semibold transition-colors"
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
        isDarkMode={true}
      />
    </div>
  );
};

export default Login;
