import React, { useState } from "react";
import { SunIcon, MoonIcon } from "lucide-react";
import axios from "axios";
//import jwt_decode from "jwt-decode"; // ⬅ install using: npm install jwt-decode
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [isDark, setIsDark] = useState(false);
  const [formData, setFormData] = useState({ userId: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate=useNavigate();

  const toggleTheme = () => setIsDark(!isDark);

  // Test backend connection
  const testBackendConnection = async () => {
    try {
      console.log("Testing backend connection...");
      // Try different URLs and endpoints
      const urls = [
        "http://127.0.0.1:8000/",
        "http://localhost:8000/",
        "http://127.0.0.1:8000/docs",
        "http://localhost:8000/docs",
        "http://127.0.0.1:8000/api/",
        "http://localhost:8000/api/"
      ];
      
      for (const url of urls) {
        try {
          console.log(`Trying: ${url}`);
          const response = await axios.get(url, { timeout: 3000 });
          console.log(`Success with ${url}:`, response.status);
          alert(`Backend is reachable at ${url}!`);
          return;
        } catch (err) {
          console.log(`Failed ${url}:`, err.message);
        }
      }
      
      throw new Error("All backend URLs failed");
    } catch (err) {
      console.error("Backend connection failed:", err);
      alert(`Backend connection failed: ${err.message}\n\nMake sure:\n1. Backend is running on port 8000\n2. CORS is enabled in backend\n3. No firewall blocking the connection`);
    }
  };

  // Test login endpoint structure
  const testLoginEndpoint = async () => {
    try {
      console.log("Testing login endpoint structure...");
      
      // Test with sample data to see what the endpoint expects
      const testData = { id: "test", password: "test" };
      console.log("Testing with:", testData);
      
      const urls = [
        "http://127.0.0.1:8000/api/general/login",
        "http://localhost:8000/api/general/login"
      ];
      
      for (const url of urls) {
        try {
          console.log(`Testing login endpoint: ${url}`);
          const response = await axios.post(url, testData, { 
            timeout: 5000,
            headers: { 'Content-Type': 'application/json' }
          });
          console.log(`Login endpoint works! Response:`, response.status, response.data);
          alert(`Login endpoint works at ${url}! Status: ${response.status}`);
          return;
        } catch (err) {
          console.log(`Login endpoint test error for ${url}:`, err.response?.status, err.response?.data);
          if (err.response?.status === 401) {
            alert(`Login endpoint works at ${url}! Got 401 (expected for invalid credentials)`);
            return;
          }
        }
      }
      
      alert("Login endpoint test failed on all URLs");
      
    } catch (err) {
      console.log("Login endpoint test error:", err);
      alert(`Login endpoint test failed: ${err.message}`);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    console.log("Attempting login with:", { userId: formData.userId, password: "***" });

    try {
      // Prepare login data
      const loginData = {
        id: formData.userId,
        password: formData.password,
      };
      
      console.log("Sending login request to:", "http://127.0.0.1:8000/api/general/login");
      console.log("Login data:", { id: formData.userId, password: "***" });
      
      // Try different backend URLs
      const backendUrls = [
        "http://127.0.0.1:8000/api/general/login",
        "http://localhost:8000/api/general/login"
      ];
      
      let res;
      let lastError;
      
      for (const url of backendUrls) {
        try {
          console.log(`Trying login with: ${url}`);
          res = await axios.post(url, loginData, {
            timeout: 10000, // 10 second timeout
            headers: {
              'Content-Type': 'application/json',
            }
          });
          console.log(`Login successful with: ${url}`);
          break;
        } catch (err) {
          console.log(`Login failed with ${url}:`, err.message);
          lastError = err;
        }
      }
      
      if (!res) {
        throw lastError || new Error("All backend URLs failed");
      }

      console.log("Login response:", res.data);
      console.log("Response status:", res.status);
      console.log("Response headers:", res.headers);

      const token = res.data?.access_token;
      const tokenType = res.data?.token_type || "bearer";

      if (!token) {
        throw new Error("No access token returned from server");
      }

      // ✅ Decode the JWT to extract user ID and role
      const decoded = jwtDecode(token);
      console.log("Decoded Token:", decoded);
      
      const userId = decoded.id;
      const role = decoded.role;

      if (!userId || !role) {
        throw new Error("Invalid token: missing user ID or role");
      }

      // ✅ Persist user info and token
      localStorage.setItem("token", token);
      localStorage.setItem("token_type", tokenType);
      localStorage.setItem("userId", userId);
      localStorage.setItem("role", role);

      // ✅ Configure axios for future requests
      axios.defaults.headers.common["Authorization"] = `${tokenType === "bearer" ? "Bearer " : ""}${token}`;

      console.log(`Login successful! User: ${userId}, Role: ${role}`);
      
      // ✅ Navigate based on role
      if (role === "admin") {
        navigate("/admin-dashboard");
      } else if (role === "manager") {
        navigate("/manager-dashboard");
      } else {
        navigate("/dashboard");
      }

    } catch (err) {
      console.error("Login error:", err);
      
      let message = "Login failed. Please check credentials.";
      
      if (err.code === 'ECONNABORTED') {
        message = "Login timeout. Please try again.";
      } else if (err.response?.status === 401) {
        message = "Invalid credentials. Please check your User ID and password.";
      } else if (err.response?.status === 404) {
        message = "Login endpoint not found. Please check if the server is running.";
      } else if (err.response?.status >= 500) {
        message = "Server error. Please try again later.";
      } else if (err.response?.data?.detail) {
        message = err.response.data.detail;
      } else if (err.response?.data?.message) {
        message = err.response.data.message;
      } else if (err.message) {
        message = err.message;
      }
      
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

        {/* Test Buttons */}
        <div className="mb-4 space-y-2">
          <button
            type="button"
            onClick={testBackendConnection}
            className="w-full text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 rounded transition-colors"
          >
            Test Backend Connection
          </button>
          <button
            type="button"
            onClick={testLoginEndpoint}
            className="w-full text-sm bg-blue-200 hover:bg-blue-300 text-blue-700 py-1 rounded transition-colors"
          >
            Test Login Endpoint
          </button>
        </div>

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

