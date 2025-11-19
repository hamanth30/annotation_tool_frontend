import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:8000/api/admin";

const PromoteReviewer = () => {
  const { projectId } = useParams();
  const [annotators, setAnnotators] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    const fetchAnnotators = async () => {
      try {
        const res = await axios.get(`${API_BASE}/annotators/${projectId}`);
        setAnnotators(res.data);
      } catch (err) {
        console.error("Error fetching annotators:", err);
      }
    };
    fetchAnnotators();
  }, [projectId]);

  const toggleSelection = (userId) => {
    setSelected((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const promoteReviewer = () => {
    if (selected.length === 0) {
      alert("Select at least one annotator");
      return;
    }
    console.log("Promote these users:", selected);
    // POST / PATCH call goes here
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Annotators in Project {projectId}</h1>

      <div className="overflow-x-auto rounded-lg shadow-md border">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3 border-b">Select</th>
              <th className="p-3 border-b">User ID</th>
              <th className="p-3 border-b">Role</th>
              <th className="p-3 border-b">Joined At</th>
            </tr>
          </thead>

          <tbody>
            {annotators.map((a, idx) => (
              <tr
                key={idx}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="p-3 border-b">
                  <input
                    type="checkbox"
                    checked={selected.includes(a.user_id)}
                    onChange={() => toggleSelection(a.user_id)}
                    className="h-4 w-4"
                  />
                </td>
                <td className="p-3 border-b">{a.user_id}</td>
                <td className="p-3 border-b">{a.project_role}</td>
                <td className="p-3 border-b">
                  {new Date(a.joined_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={promoteReviewer}
        className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Promote Reviewer
      </button>
    </div>
  );
};

export default PromoteReviewer;
