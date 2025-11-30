import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

export default function AssignToAnnotatorPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Received from previous page
  const selectedFileIds = location.state?.selectedFileIds || [];
  console.log(selectedFileIds)

  const [annotators, setAnnotators] = useState([]);
  const [loading, setLoading] = useState(false);

  // Single selected annotator ID
  const [selectedAnnotator, setSelectedAnnotator] = useState(null);

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
    if (!selectedFileIds.length) {
      alert("No file IDs received! Redirecting back...");
      navigate(-1);
      return;
    }
    fetchAnnotators();
  }, [projectId]);

  const handleAssign = async () => {
    if (!selectedAnnotator) {
      alert("Select one annotator before assigning.");
      return;
    }

    try {
      const payload = {
        file_ids: selectedFileIds,
        user_id: selectedAnnotator,
      };

      console.log("Sending payload:", payload);

      const res = await axios.post("http://localhost:8000/api/admin/annotation_table", payload);

      alert("Files successfully assigned!");
      navigate("/admin/ongoingprojects");
    } catch (err) {
      console.error("Assignment error:", err);
      alert("Error assigning files.");
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

      <h2 className="text-3xl font-extrabold text-gray-800 mb-4">
        Assign {selectedFileIds.length} File(s) — Project {projectId}
      </h2>

      <p className="text-gray-600 mb-6">
        Received file IDs: {JSON.stringify(selectedFileIds)}
      </p>

      {loading && <p className="text-gray-500 text-lg">Loading annotators...</p>}

      {/* Annotator Table */}
      {!loading && annotators.length > 0 && (
        <div className="overflow-x-auto rounded-xl border shadow bg-white">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 text-gray-700 border-b">
              <tr>
                <th className="py-4 px-4">Select</th>
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
                  {/* Radio button → only one annotator */}
                  <td className="py-4 px-4">
                    <input
                      type="radio"
                      name="annotator"
                      checked={selectedAnnotator === a.user_id}
                      onChange={() => setSelectedAnnotator(a.user_id)}
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

                  {/* Joined */}
                  <td className="py-4 px-4 text-gray-500">
                    {new Date(a.joined_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Assign Button */}
      {selectedAnnotator && (
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleAssign}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow"
          >
            Assign Files to {selectedAnnotator}
          </button>
        </div>
      )}
    </div>
  );
}
