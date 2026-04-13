import { useState } from "react";
import { X, Mail, ArrowRight, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const ForgotPasswordModal = ({ isOpen, onClose, isDarkMode }) => {
  const [step, setStep] = useState(1); // 1: Email, 2: Reset token, 3: New password
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // Step 1: Request password reset
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Check your email for reset instructions");
        setStep(2);
      } else {
        toast.error(data.message || "Failed to request password reset");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error requesting password reset");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset password with token
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!resetToken.trim()) {
      toast.error("Please enter the reset token");
      return;
    }

    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: resetToken,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Password reset successfully! Please log in.");
        setTimeout(() => {
          onClose();
          setStep(1);
          setEmail("");
          setResetToken("");
          setNewPassword("");
          setConfirmPassword("");
        }, 1500);
      } else {
        toast.error(data.message || "Failed to reset password");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error resetting password");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className={`relative w-full max-w-md rounded-2xl shadow-2xl border ${
          isDarkMode
            ? "bg-slate-900 border-white/10"
            : "bg-white border-gray-200"
        }`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors ${
            isDarkMode
              ? "text-white/60 hover:text-white"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <X size={24} />
        </button>

        <div className="p-8">
          {/* Step 1: Forgot Password */}
          {step === 1 && (
            <form onSubmit={handleForgotPassword}>
              <h2
                className={`text-2xl font-bold mb-2 flex items-center gap-2 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                <Mail size={28} className="text-blue-400" />
                Forgot Password
              </h2>
              <p
                className={`text-sm mb-6 ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Enter your email to receive a password reset link
              </p>

              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 mb-4 rounded-lg border outline-none transition-all ${
                  isDarkMode
                    ? "bg-slate-800 border-white/20 text-white placeholder-gray-500 focus:border-blue-400/50 focus:bg-slate-700"
                    : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:bg-white"
                }`}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Send Reset Link"}
                <ArrowRight size={18} />
              </button>
            </form>
          )}

          {/* Step 2: Enter Token and New Password */}
          {step === 2 && (
            <form onSubmit={handleResetPassword}>
              <h2
                className={`text-2xl font-bold mb-2 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Reset Password
              </h2>
              <p
                className={`text-sm mb-6 ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Check your email for the reset token. Enter it below with your
                new password.
              </p>

              <input
                type="text"
                placeholder="Reset token from email"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                className={`w-full px-4 py-3 mb-4 rounded-lg border outline-none transition-all text-sm ${
                  isDarkMode
                    ? "bg-slate-800 border-white/20 text-white placeholder-gray-500 focus:border-blue-400/50 focus:bg-slate-700"
                    : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:bg-white"
                }`}
              />

              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`w-full px-4 py-3 mb-4 rounded-lg border outline-none transition-all ${
                  isDarkMode
                    ? "bg-slate-800 border-white/20 text-white placeholder-gray-500 focus:border-blue-400/50 focus:bg-slate-700"
                    : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:bg-white"
                }`}
              />

              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-4 py-3 mb-4 rounded-lg border outline-none transition-all ${
                  isDarkMode
                    ? "bg-slate-800 border-white/20 text-white placeholder-gray-500 focus:border-blue-400/50 focus:bg-slate-700"
                    : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-400 focus:bg-white"
                }`}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Resetting..." : "Reset Password"}
                <CheckCircle size={18} />
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setResetToken("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                className={`w-full mt-3 px-4 py-3 rounded-lg font-semibold transition-all ${
                  isDarkMode
                    ? "bg-white/10 hover:bg-white/20 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                }`}
              >
                Back
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
