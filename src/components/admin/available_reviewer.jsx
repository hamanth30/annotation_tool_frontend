import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ProjectEditors() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [editors, setEditors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState([]);

  const apiBase = "http://localhost:8000/api/admin";

  // Fetch editors
  const fetchEditors = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiBase}/projects/${projectId}/editors`);
      setEditors(res.data?.editors || []);
    } catch (err) {
      console.error("Error fetching editors:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEditors();
  }, [projectId]);

  // Toggle select user
  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((u) => u !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      
      {/* BACK BUTTON */}
      <button
        onClick={() => navigate("/admin/ongoingprojects")}
        className="mb-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 shadow"
      >
        <span className="text-xl">←</span> Back
      </button>

      {/* HEADER */}
      <h2 className="text-3xl font-extrabold text-gray-800 mb-6">
        Reviewers — Project {projectId}
      </h2>

      {loading && <p className="text-gray-500 text-lg">Loading...</p>}

      {!loading && editors.length === 0 && (
        <p className="text-gray-500 text-lg">No editors found.</p>
      )}

      {/* TABLE */}
      {!loading && editors.length > 0 && (
        <div className="overflow-x-auto rounded-xl shadow">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left font-semibold text-gray-700">Select</th>
                <th className="p-3 text-left font-semibold text-gray-700">User ID</th>
                <th className="p-3 text-left font-semibold text-gray-700">Name</th>
                <th className="p-3 text-left font-semibold text-gray-700">Role</th>
              </tr>
            </thead>

            <tbody>
              {editors.map((editor, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(editor.user_id)}
                      onChange={() => toggleSelect(editor.user_id)}
                      className="h-5 w-5 accent-indigo-600"
                    />
                  </td>
                  <td className="p-3 text-gray-800">{editor.user_id}</td>
                  <td className="p-3 text-gray-800">{editor.name}</td>
                  <td className="p-3 text-gray-800 font-medium">Reviewer</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ASSIGN BUTTON */}
      {selected.length > 0 && (
        <div className="mt-6 flex justify-end">
          <button
            
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow"
          >
            Assign Review File
          </button>
        </div>
      )}
    </div>
  );
}
