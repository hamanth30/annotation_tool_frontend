import React, { useState, useEffect } from "react";
import { UserPlus } from "lucide-react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE_URL = "http://localhost:8000/api/admin";

const generateVISTAID = () => {
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `VISTA${randomDigits}`;
};

const NewUser = () => {
  const [form, setForm] = useState({
    id: generateVISTAID(),
    name: "",
    email: "",
    role: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.id || !form.name || !form.email || !form.role || !form.password) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      const userPayload = {
        id: form.id,
        name: form.name,
        email: form.email,
        role: form.role,
        password: form.password,
        otp: null,
        otpExpiry: null,
      };

      await axios.post(`${API_BASE_URL}/add-user`, userPayload);

      toast.success("User created successfully!");

      // Reset form with new VISTA ID
      setForm({
        id: generateVISTAID(),
        name: "",
        email: "",
        role: "",
        password: "",
      });

    } catch (error) {
      console.error("Error:", error);

      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error("Failed to create user");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-amber-100">
      <ToastContainer />

      <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent mb-6 flex items-center gap-3">
        <UserPlus className="text-amber-400" size={38} />
        Add New User
      </h1>

      <div className="bg-gradient-to-br from-gray-900/80 to-black/70 rounded-2xl p-8 border border-amber-500/20 shadow-xl">
        <form className="space-y-6" onSubmit={handleSubmit}>

          {/* User ID */}
          <div>
            <label className="block mb-2 text-amber-300 font-medium tracking-wide">
              Employee ID (Auto-Generated)
            </label>
            <input
              type="text"
              name="id"
              value={form.id}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-white text-black border border-amber-500/30 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Name */}
          <div>
            <label className="block mb-2 text-amber-300 font-medium tracking-wide">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter full name"
              className="w-full px-4 py-3 rounded-xl bg-white text-black border border-amber-500/30 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block mb-2 text-amber-300 font-medium tracking-wide">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter email"
              className="w-full px-4 py-3 rounded-xl bg-white text-black border border-amber-500/30 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block mb-2 text-amber-300 font-medium tracking-wide">
              Select Role
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-white text-black border border-amber-500/30 focus:ring-2 focus:ring-amber-500"
            >
              <option value="" disabled>
                Choose a role
              </option>
              <option value="admin">Admin</option>
              <option value="employee">Employee</option>
            </select>
          </div>

          {/* Password */}
          <div>
            <label className="block mb-2 text-amber-300 font-medium tracking-wide">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter password"
              className="w-full px-4 py-3 rounded-xl bg-white text-black border border-amber-500/30 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-semibold py-3 rounded-xl hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create User"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default NewUser;
