import React, { useState, useEffect } from "react";

const API_BASE_URL = "http://localhost:8000"; // 👈 your backend base URL

const NewUser = () => {
  const [userId, setUserId] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [loading, setLoading] = useState(false);

  // Auto-generate user ID like VISTAxxxx
  const generateUserId = () => {
    return "VISTA" + Math.floor(1000 + Math.random() * 9000);
  };

  useEffect(() => {
    setUserId(generateUserId());
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Form validation
    if (!formData.name || !formData.email || !formData.password || !formData.role) {
      alert("Please fill all the fields!");
      return;
    }

    const newUser = {
      id: userId,
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      otp: null,
      otpExpiry: null,
    };

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/admin/add-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle errors returned from FastAPI
        throw new Error(result.detail || "Failed to add user");
      }

      alert(`✅ ${result.message}`);
      console.log("User Created:", result.user);

      // Reset form and generate a new user ID
      setFormData({ name: "", email: "", password: "", role: "" });
      setUserId(generateUserId());
    } catch (error) {
      console.error("Error adding user:", error);
      alert(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mt-15 mx-auto bg-white shadow-md rounded-xl p-6">
      <h2 className="text-2xl font-semibold text-indigo-600 mb-6 text-center">
        Add New User
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Auto-generated ID */}
        <div>
          <label className="block text-gray-600 font-medium mb-1">User ID</label>
          <input
            type="text"
            value={userId}
            readOnly
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
          />
        </div>

        {/* Name */}
        <div>
          <label className="block text-gray-600 font-medium mb-1">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter user's full name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-gray-600 font-medium mb-1">Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter user's email"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-gray-600 font-medium mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter a secure password"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {/* Role */}
        <div>
          <label className="block text-gray-600 font-medium mb-1">Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">Select role</option>
            <option value="Employee">Employee</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full ${
            loading ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"
          } text-white py-2 rounded-lg font-medium transition duration-300`}
        >
          {loading ? "Creating..." : "Create User"}
        </button>
      </form>
    </div>
  );
};

export default NewUser;
