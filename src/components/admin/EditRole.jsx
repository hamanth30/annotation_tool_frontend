import React, { useState } from "react";
import { Search, UserCog } from "lucide-react";

const EditRole = () => {
  const [userId, setUserId] = useState("");
  const [userData, setUserData] = useState(null);
  const [newRole, setNewRole] = useState("");

  // Sample hardcoded user data (mock database)
  const sampleUsers = [
    { id: "VISTA1234", name: "Hemanth", role: "Annotator" },
    { id: "VISTA2345", name: "Mahaashri", role: "Reviewer" },
    { id: "VISTA3456", name: "Saravanan", role: "Manager" },
    { id: "VISTA4567", name: "Dharshini", role: "Admin" },
  ];

  // Handle search for user by ID
  const handleSearch = () => {
    const foundUser = sampleUsers.find((u) => u.id === userId.trim());
    if (!foundUser) {
      alert("User ID not found!");
      setUserData(null);
    } else {
      setUserData(foundUser);
      setNewRole(foundUser.role);
    }
  };

  // Handle saving new role
  const handleSave = () => {
    if (!newRole) {
      alert("Please select a new role before saving.");
      return;
    }
    alert(
      `Role updated for ${userData.name} (${userData.id}) — New Role: ${newRole}`
    );
    console.log("Updated Role:", {
      ...userData,
      updatedRole: newRole,
    });
  };

  return (
    <div className="max-w-xl mx-auto bg-white shadow-md rounded-xl p-8">
      <h2 className="text-2xl font-semibold text-indigo-600 mb-6 text-center">
        Edit User Role
      </h2>

      {/* Search User ID */}
      <div className="flex items-center gap-2 mb-6">
        <input
          type="text"
          placeholder="Enter User ID (e.g., VISTA1234)"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
        />
        <button
          onClick={handleSearch}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-1"
        >
          <Search size={18} />
          Search
        </button>
      </div>

      {/* User Info */}
      {userData && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <UserCog className="text-indigo-600" size={24} />
            <div>
              <p className="text-lg font-medium text-gray-800">
                {userData.name}
              </p>
              <p className="text-sm text-gray-500">ID: {userData.id}</p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-700 font-medium">
              Current Role:{" "}
              <span className="text-indigo-600 font-semibold">
                {userData.role}
              </span>
            </p>

            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-400 outline-none"
            >
              <option value="Annotator">Annotator</option>
              <option value="Reviewer">Reviewer</option>
              <option value="Manager">Manager</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default EditRole;
