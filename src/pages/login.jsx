import React, { useState } from "react";
import { SunIcon, MoonIcon } from "lucide-react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

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

      // ✅ Backend API call
      const res = await axios.post(
        "http://127.0.0.1:8000/api/general/login",
        loginData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const token = res.data?.access_token;
      const tokenType = res.data?.token_type || "bearer";

      if (!token) throw new Error("No token returned from server");

      // ✅ Decode JWT to extract user info
      const decoded = jwtDecode(token);
      console.log("Decoded JWT:", decoded);

      const userId = decoded.id;
      const role = decoded.role;

      // ✅ Save to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("token_type", tokenType);
      localStorage.setItem("userId", userId);
      localStorage.setItem("role", role);

      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // ✅ Redirect based on role
      if (role === "admin") {
        navigate("/admin");
      } else {
        navigate("/employee");
      }
    } catch (err) {
      console.error("Login error:", err);
      let message = "Login failed. Please check credentials.";
      if (err.response?.status === 401)
        message = "Invalid ID or password.";
      if (err.code === "ECONNREFUSED")
        message = "Backend not reachable. Start FastAPI server.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center transition-all duration-500 ${
        isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-5 right-5 p-2 rounded-full transition-colors duration-300 hover:bg-gray-200 dark:hover:bg-gray-800"
      >
        {isDark ? (
          <SunIcon className="w-6 h-6 text-yellow-400" />
        ) : (
          <MoonIcon className="w-6 h-6 text-gray-700" />
        )}
      </button>

      {/* Login Card */}
      <div
        className={`w-full max-w-sm p-8 rounded-2xl shadow-md transition-all duration-300 ${
          isDark ? "bg-gray-800" : "bg-white border border-gray-200"
        }`}
      >
        <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User ID */}
          <div>
            <label className="block text-sm font-medium mb-1">User ID</label>
            <input
              type="text"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              placeholder="Enter your ID"
              className={`w-full px-4 py-2 rounded-lg border focus:outline-none transition-all duration-200 ${
                isDark
                  ? "bg-gray-700 border-gray-600 focus:border-yellow-400"
                  : "bg-gray-50 border-gray-300 focus:border-yellow-500"
              }`}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={`w-full px-4 py-2 rounded-lg border focus:outline-none transition-all duration-200 ${
                isDark
                  ? "bg-gray-700 border-gray-600 focus:border-yellow-400"
                  : "bg-gray-50 border-gray-300 focus:border-yellow-500"
              }`}
              required
            />
          </div>

          {/* Error */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-4 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            )}
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
