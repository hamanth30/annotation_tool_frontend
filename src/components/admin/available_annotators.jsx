import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function AnnotatorsPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [annotators, setAnnotators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState([]);

  const apiBase = "http://localhost:8000/api/admin";

  const fetchAnnotators = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiBase}/annotators/${projectId}`);
      setAnnotators(res.data || []);
    } catch (err) {
      console.error("Error fetching annotators:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAnnotators();
  }, [projectId]);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === annotators.length) {
      setSelected([]);
    } else {
      setSelected(annotators.map((a) => a.user_id));
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* BACK BUTTON */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow flex items-center gap-2"
      >
        ← Back
      </button>

      <h2 className="text-3xl font-extrabold text-gray-800 mb-6">
        Annotators — Project {projectId}
      </h2>

      {loading && <p className="text-gray-500 text-lg">Loading...</p>}
      {!loading && annotators.length === 0 && (
        <p className="text-gray-500 text-lg">No annotators found.</p>
      )}

      {!loading && annotators.length > 0 && (
        <div className="overflow-x-auto rounded-xl border shadow bg-white">

          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 text-gray-700 border-b">
              <tr>
                <th className="py-4 px-4">
                  {/* <input
                    type="checkbox"
                    checked={selected.length === annotators.length}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 cursor-pointer"
                  /> */}
                </th>
                <th className="py-4 px-4 font-semibold">User ID</th>
                <th className="py-4 px-4 font-semibold">Role</th>
                <th className="py-4 px-4 font-semibold">Joined At</th>
              </tr>
            </thead>

            <tbody>
              {annotators.map((a) => (
                <tr
                  key={a.user_id}
                  className="border-b hover:bg-indigo-50 transition-all duration-150"
                >
                  {/* Checkbox */}
                  <td className="py-4 px-4">
                    <input
                      type="checkbox"
                      checked={selected.includes(a.user_id)}
                      onChange={() => toggleSelect(a.user_id)}
                      className="h-4 w-4 cursor-pointer"
                    />
                  </td>

                  {/* User ID */}
                  <td className="py-4 px-4 font-medium text-gray-800">
                    {a.user_id}
                  </td>

                  {/* Role */}
                  <td className="py-4 px-4 text-gray-600 capitalize">
                    {a.project_role}
                  </td>

                  {/* Joined At */}
                  <td className="py-4 px-4 text-gray-500">
                    {new Date(a.joined_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Selected Count */}
      {selected.length > 0 && (
        <div className="mt-5 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
          <p className="text-indigo-700 font-semibold">
            Selected: {selected.length} annotators
          </p>
        </div>
      )}
    </div>
  );
}
