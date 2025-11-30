import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { ArrowLeft, UserCheck, Loader2 } from "lucide-react";

const API_BASE = "http://localhost:8000/api/admin";

const PromoteReviewer = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [annotators, setAnnotators] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [promoting, setPromoting] = useState(false);

  useEffect(() => {
    const fetchAnnotators = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/annotators/${projectId}`);
        // Filter to only show annotators (not editors/reviewers)
        const annotatorsOnly = (res.data || []).filter(
          (a) => a.project_role === "annotator"
        );
        setAnnotators(annotatorsOnly);
      } catch (err) {
        console.error("Error fetching annotators:", err);
        toast.error("Failed to load annotators");
      } finally {
        setLoading(false);
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

  const toggleSelectAll = () => {
    if (selected.length === annotators.length) {
      setSelected([]);
    } else {
      setSelected(annotators.map((a) => a.user_id));
    }
  };

  const promoteReviewer = async () => {
    if (selected.length === 0) {
      toast.warning("Please select at least one annotator to promote");
      return;
    }

    setPromoting(true);
    try {
      const response = await axios.put(
        `${API_BASE}/annotators/${projectId}/promote`,
        { user_ids: selected },
        { headers: { "Content-Type": "application/json" } }
      );

      toast.success(response.data.message || `${selected.length} annotator(s) promoted to editor successfully`);
      
      // Refresh the list and filter out promoted users
      const res = await axios.get(`${API_BASE}/annotators/${projectId}`);
      const annotatorsOnly = (res.data || []).filter(
        (a) => a.project_role === "annotator"
      );
      setAnnotators(annotatorsOnly);
      setSelected([]);
    } catch (err) {
      console.error("Error promoting annotators:", err);
      const errorMessage = err.response?.data?.detail || "Failed to promote annotators";
      toast.error(errorMessage);
    } finally {
      setPromoting(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-black via-neutral-900 to-gray-900 text-amber-100">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 bg-amber-900/40 border border-amber-600 text-amber-200 rounded-lg hover:bg-amber-800/50 transition flex items-center gap-2 shadow-lg"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent mb-2 flex items-center gap-3">
          <UserCheck className="text-amber-400" size={38} />
          Promote Annotators to Editor
        </h1>
        <p className="text-amber-300/70 text-sm">Project ID: <span className="font-semibold text-amber-200">{projectId}</span></p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-amber-400" size={32} />
          <span className="ml-3 text-amber-300">Loading annotators...</span>
        </div>
      ) : annotators.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-900/80 to-black/70 rounded-2xl p-8 border border-amber-500/20 shadow-xl text-center">
          <p className="text-amber-300/70 text-lg">No annotators found in this project.</p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-gradient-to-br from-gray-900/80 to-black/70 rounded-2xl border border-amber-500/20 shadow-xl overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead className="bg-amber-900/20 border-b border-amber-700/30">
                  <tr>
                    <th className="p-4 text-left">
                      <input
                        type="checkbox"
                        checked={selected.length === annotators.length && annotators.length > 0}
                        onChange={toggleSelectAll}
                        className="h-5 w-5 cursor-pointer accent-amber-500"
                      />
                    </th>
                    <th className="p-4 text-left text-amber-300 font-semibold">User ID</th>
                    <th className="p-4 text-left text-amber-300 font-semibold">Role</th>
                    <th className="p-4 text-left text-amber-300 font-semibold">Joined At</th>
                  </tr>
                </thead>
                <tbody>
                  {annotators.map((a, idx) => (
                    <tr
                      key={a.user_id}
                      className={`border-b border-amber-700/20 transition-colors ${
                        selected.includes(a.user_id)
                          ? "bg-amber-900/30"
                          : "hover:bg-amber-900/10"
                      }`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selected.includes(a.user_id)}
                          onChange={() => toggleSelection(a.user_id)}
                          className="h-5 w-5 cursor-pointer accent-amber-500"
                        />
                      </td>
                      <td className="p-4 text-amber-100 font-medium">{a.user_id}</td>
                      <td className="p-4">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-900/40 text-amber-200 border border-amber-600/30">
                          {a.project_role}
                        </span>
                      </td>
                      <td className="p-4 text-amber-300/80">
                        {new Date(a.joined_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Selected Count */}
          {selected.length > 0 && (
            <div className="mb-6 p-4 bg-gradient-to-r from-amber-900/30 to-amber-800/20 rounded-xl border border-amber-600/30 shadow-lg">
              <p className="text-amber-200 font-semibold flex items-center gap-2">
                <UserCheck size={18} />
                {selected.length} annotator{selected.length > 1 ? "s" : ""} selected for promotion
              </p>
            </div>
          )}

          {/* Promote Button */}
          <div className="flex justify-end">
            <button
              onClick={promoteReviewer}
              disabled={selected.length === 0 || promoting}
              className="px-8 py-3 bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-semibold rounded-xl hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {promoting ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Promoting...
                </>
              ) : (
                <>
                  <UserCheck size={18} />
                  Promote {selected.length > 0 ? `${selected.length} ` : ""}to Editor
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PromoteReviewer;
