import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function Removeuser() {
  const { projectId } = useParams();

  const [annotators, setAnnotators] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = "http://localhost:8000/api/admin";

  useEffect(() => {
    const fetchAnnotators = async () => {
      try {
        const res = await axios.get(`${API_BASE}/annotators/${projectId}`);
        setAnnotators(res.data || []);
      } catch (err) {
        console.error("Error fetching annotators:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnotators();
  }, [projectId]);

  const toggleSelection = (user_id) => {
    setSelectedUsers((prev) =>
      prev.includes(user_id)
        ? prev.filter((id) => id !== user_id)
        : [...prev, user_id]
    );
  };

  const handleRemoveUsers = () => {
    console.log("Selected users to remove:", selectedUsers);

    // Hit your remove API here if needed
    // axios.post(`${API_BASE}/annotators/${projectId}/remove`, {
    //   users: selectedUsers,
    // });
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
      <h2 className="text-3xl font-bold text-indigo-600 mb-6 text-center">
        Annotators for Project {projectId}
      </h2>

      <div className="overflow-x-auto shadow-lg rounded-lg">
        <table className="w-full border border-gray-300">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="p-3">Select</th>
              <th className="p-3 text-left">User ID</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Joined At</th>
            </tr>
          </thead>

          <tbody className="bg-white">
            {annotators.map((a) => (
              <tr
                key={a.user_id}
                className="border-b hover:bg-gray-100 transition"
              >
                <td className="p-3 text-center">
                  <input
                    type="checkbox"
                    className="h-5 w-5 cursor-pointer"
                    checked={selectedUsers.includes(a.user_id)}
                    onChange={() => toggleSelection(a.user_id)}
                  />
                </td>

                <td className="p-3 font-semibold text-gray-800">
                  {a.user_id}
                </td>

                <td className="p-3 capitalize text-gray-700">
                  {a.project_role}
                </td>

                <td className="p-3 text-gray-600">
                  {new Date(a.joined_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Remove Users Button */}
      <div className="flex justify-end mt-6">
        <button
          onClick={handleRemoveUsers}
          className="bg-red-600 text-white px-6 py-3 rounded-md shadow-md hover:bg-red-700 transition"
        >
          Remove Users
        </button>
      </div>
    </div>
  );
}
