import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { ArrowLeft, UserX, Loader2, Trash2, CheckCircle2 } from "lucide-react";

export default function Removeuser() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [annotators, setAnnotators] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(false);

  const API_BASE = "http://localhost:8000/api/admin";

  // Fetch annotators function (extracted so we can re-use)
  const fetchAnnotators = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/annotators/${projectId}`);
      console.log("Fetched annotators:", res.data);
      setAnnotators(res.data || []);
    } catch (err) {
      console.error("Error fetching annotators:", err);
      // Show a toast but keep UI usable
      const msg = err.response?.data?.detail || err.message || "Failed to fetch annotators";
      toast.error(msg);
      setAnnotators([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnotators();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const toggleSelection = (user_id) => {
    setSelectedUsers((prev) =>
      prev.includes(user_id) ? prev.filter((id) => id !== user_id) : [...prev, user_id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === annotators.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(annotators.map((a) => a.user_id));
    }
  };

  const handleRemoveUsers = async () => {
    if (selectedUsers.length === 0) {
      toast.warning("Select at least one user to remove.");
      return;
    }

    const ok = window.confirm(
      `Remove ${selectedUsers.length} selected user(s) from project ${projectId}? This cannot be undone.`
    );
    if (!ok) return;

    setRemoving(true);
    try {
      // Prepare payload: ensure it matches your backend model
      const payload = {
        project_id: projectId,
        user_ids: selectedUsers,
      };

      // axios.delete needs data under config.data
      const res = await axios.delete(`${API_BASE}/remove_members`, { data: payload });

      // Success
      const message = res.data?.message || `${selectedUsers.length} users removed.`;
      toast.success(message);

      // Clear selection and refresh list
      setSelectedUsers([]);
      await fetchAnnotators();
    } catch (err) {
      console.error("Remove users failed:", err);

      // Prefer server message if present
      const serverMessage = err.response?.data?.detail || err.response?.data?.message;
      const msg = serverMessage || err.message || "Failed to remove users";
      toast.error(msg);

      // If server returned 500, also print server body for debugging
      if (err.response?.status === 500) {
        console.error("Server 500 response body:", err.response.data);
      }
    } finally {
      setRemoving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-black via-neutral-900 to-gray-900 text-amber-100">
        <div className="flex items-center gap-3">
          <Loader2 className="animate-spin text-amber-400" size={32} />
          <span className="text-amber-300 text-lg">Loading annotators...</span>
        </div>
      </div>
    );
  }

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
          <UserX className="text-amber-400" size={38} />
          Remove Users from Project
        </h1>
        <p className="text-amber-300/70 text-sm">Project ID: <span className="font-semibold text-amber-200">{projectId}</span></p>
      </div>

      {annotators.length === 0 ? (
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
                        checked={selectedUsers.length === annotators.length && annotators.length > 0}
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
                  {annotators.map((a) => (
                    <tr
                      key={a.user_id}
                      className={`border-b border-amber-700/20 transition-colors ${
                        selectedUsers.includes(a.user_id)
                          ? "bg-amber-900/30"
                          : "hover:bg-amber-900/10"
                      }`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(a.user_id)}
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
                        {a.joined_at ? new Date(a.joined_at).toLocaleString() : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Selected Count */}
          {selectedUsers.length > 0 && (
            <div className="mb-6 p-4 bg-gradient-to-r from-red-900/30 to-red-800/20 rounded-xl border border-red-600/30 shadow-lg">
              <p className="text-amber-200 font-semibold flex items-center gap-2">
                <Trash2 size={18} />
                {selectedUsers.length} user{selectedUsers.length > 1 ? "s" : ""} selected for removal
              </p>
            </div>
          )}

          {/* Remove Button */}
          <div className="flex justify-end">
            <button
              onClick={handleRemoveUsers}
              disabled={removing || selectedUsers.length === 0}
              className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-red-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {removing ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Removing...
                </>
              ) : (
                <>
                  <UserX size={18} />
                  Remove {selectedUsers.length > 0 ? `${selectedUsers.length} ` : ""}User{selectedUsers.length !== 1 ? "s" : ""}
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
