import React, { useState, useEffect } from "react";

const NewUser = () => {
  const [userId, setUserId] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  // Auto-generate user ID like VISTAxxxx
  useEffect(() => {
    const randomId = "VISTA" + Math.floor(1000 + Math.random() * 9000);
    setUserId(randomId);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Form validation
    if (!formData.name || !formData.email || !formData.password || !formData.role) {
      alert("Please fill all the fields!");
      return;
    }

    const newUser = {
      id: userId,
      ...formData,
    };

    console.log("New User Data:", newUser);
    alert(`User ${formData.name} created successfully with ID ${userId}!`);

    // Clear form
    setFormData({ name: "", email: "", password: "", role: "" });
    const randomId = "VISTA" + Math.floor(1000 + Math.random() * 9000);
    setUserId(randomId);
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
            <option value="">Select Role</option>
            <option value="Annotator">Annotator</option>
            <option value="Reviewer">Reviewer</option>
            <option value="Manager">Manager</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition duration-300"
        >
          Create User
        </button>
      </form>
    </div>
  );
};

export default NewUser;