import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

const AddUserPage = () => {
  const { projectId } = useParams();
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvailableUsers = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/admin/${projectId}/available-users`
        );
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableUsers();
  }, [projectId]);

  const toggleUserSelection = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id)
        ? prev.filter((userId) => userId !== id)
        : [...prev, id]
    );
  };

  const handleAddUser = () => {
    console.log("Selected users to add:", selectedUsers);

    // call your POST API here if needed
    // axios.post(`/api/admin/${projectId}/add-users`, { users: selectedUsers })
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10">

      <h2 className="text-3xl font-bold text-indigo-600 text-center mb-8">
        Available Users for Project {projectId}
      </h2>

      <div className="overflow-x-auto shadow-lg rounded-lg">
        <table className="w-full border border-gray-300">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="p-3 text-left">Select</th>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
            </tr>
          </thead>

          <tbody className="bg-white">
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b hover:bg-gray-100 transition"
              >
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => toggleUserSelection(user.id)}
                    className="h-5 w-5 cursor-pointer"
                  />
                </td>

                <td className="p-3 font-semibold text-gray-800">{user.id}</td>
                <td className="p-3 text-gray-700">{user.name}</td>
                <td className="p-3 text-gray-600">{user.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Button */}
      <div className="flex justify-end mt-6">
        <button
          onClick={handleAddUser}
          className="bg-green-600 text-white px-6 py-3 rounded-md shadow-md hover:bg-green-700 transition duration-150"
        >
          Add User
        </button>
      </div>
    </div>
  );
};

export default AddUserPage;
