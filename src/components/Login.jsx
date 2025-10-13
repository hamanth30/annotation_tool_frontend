import React, { useState } from "react";
import { SunIcon, MoonIcon } from "lucide-react"; // Make sure to install: npm i lucide-react

export default function Login() {
  const [isDark, setIsDark] = useState(false);
  const [formData, setFormData] = useState({ userId: "", password: "" });

  const toggleTheme = () => setIsDark(!isDark);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login attempt:", formData);
    // TODO: Call your backend auth API here
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

          {/* Submit */}
          <button
            type="submit"
            className="w-full mt-4 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 rounded-lg transition-all duration-300"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
