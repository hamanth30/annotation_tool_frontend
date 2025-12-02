import React, { useState } from "react";
import { SunIcon, MoonIcon, Lock, User } from "lucide-react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import loginBg from "../assets/annotation_tool_login.png";

export default function Login() {
  const [isDark, setIsDark] = useState(false);
  const [formData, setFormData] = useState({ userId: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const toggleTheme = () => setIsDark(!isDark);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const loginData = {
        id: formData.userId,
        password: formData.password,
      };

      // ✅ Call FastAPI backend for login
      const res = await axios.post("http://127.0.0.1:8000/api/general/login", loginData, {
        headers: { "Content-Type": "application/json" },
      });

      const token = res.data?.access_token;
      const tokenType = res.data?.token_type || "bearer";

      if (!token) throw new Error("No token returned from server");

      // ✅ Decode JWT to extract user info
      const decoded = jwtDecode(token);
      console.log("Decoded JWT:", decoded);

      // ✅ Extract fields from decoded token
      // Adjust field names below based on your backend payload keys
      const userId = decoded.user_id || decoded.id || decoded.sub;
      const role = decoded.role || "employee";
      const name = decoded.name || decoded.username || "";

      if (!userId) throw new Error("User ID missing in token");

      // ✅ Store securely in localStorage for later use
      localStorage.setItem("token", token);
      localStorage.setItem("token_type", tokenType);
      localStorage.setItem("userId", userId);
      localStorage.setItem("role", role);
      localStorage.setItem("name", name);

      // ✅ Set default Authorization header
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // ✅ Redirect based on role
      if (role.toLowerCase() === "admin") {
        navigate("/admin");
      } else {
        navigate("/employee");
      }
    } catch (err) {
      console.error("Login error:", err);
      let message = "Login failed. Please check credentials.";
      if (err.response?.status === 401) message = "Invalid ID or password.";
      if (err.code === "ECONNREFUSED")
        message = "Backend not reachable. Start FastAPI server.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: `url(${loginBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Dark overlay for better readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-black/80 backdrop-blur-sm"></div>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 z-20 p-3 rounded-full bg-black/40 backdrop-blur-md border border-amber-500/30 transition-all duration-300 hover:bg-black/60 hover:border-amber-500/50 hover:scale-110 shadow-lg"
        aria-label="Toggle theme"
      >
        {isDark ? (
          <SunIcon className="w-5 h-5 text-amber-400" />
        ) : (
          <MoonIcon className="w-5 h-5 text-amber-300" />
        )}
      </button>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-gradient-to-br from-neutral-900/95 via-black/95 to-neutral-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-amber-600/30 p-8 md:p-10 transition-all duration-500 hover:shadow-amber-500/20 hover:border-amber-500/50">
          {/* Logo/Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 mb-4 shadow-lg shadow-amber-500/30">
              <Lock className="w-8 h-8 text-black" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 bg-clip-text text-transparent mb-2">
              Welcome Back
            </h2>
            <p className="text-amber-300/70 text-sm">Sign in to continue to your workspace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* User ID */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-amber-200 mb-2">
                <User className="w-4 h-4" />
                User ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  placeholder="Enter your ID"
                  className="w-full px-4 py-3 pl-11 rounded-xl bg-black/40 border border-amber-500/30 text-amber-100 placeholder-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all duration-200 backdrop-blur-sm"
                  required
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-500/60" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-amber-200 mb-2">
                <Lock className="w-4 h-4" />
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pl-11 rounded-xl bg-black/40 border border-amber-500/30 text-amber-100 placeholder-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all duration-200 backdrop-blur-sm"
                  required
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-500/60" />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 rounded-lg bg-red-900/30 border border-red-500/50 text-red-300 text-sm flex items-center gap-2 animate-pulse">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-6 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-bold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-[1.02] active:scale-[0.98] ${
                loading ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-amber-400/50">
              Secure access to your annotation workspace
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
