import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { ArrowLeft, UserPlus, Search, Loader2, CheckCircle2 } from "lucide-react";

const API_BASE_URL = "http://localhost:8000";

const AddUserPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [projectName, setProjectName] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  // Debug: Log when component renders
  useEffect(() => {
    console.log("AddUserPage rendered with projectId:", projectId);
  }, [projectId]);

  // Fetch project name and available users
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch project details to get project name
        const projectsResponse = await axios.get(
          `${API_BASE_URL}/api/admin/get_all_projects`
        );
        
        // Try multiple comparison methods to handle different ID types
        const project = projectsResponse.data.find(
          (p) => 
            String(p.id) === String(projectId) || 
            p.id === parseInt(projectId) ||
            parseInt(p.id) === parseInt(projectId)
        );
        
        if (project) {
          setProjectName(project.name);
        } else {
          console.error("Project not found. ProjectId:", projectId, "Available projects:", projectsResponse.data.map(p => ({ id: p.id, name: p.name })));
          toast.error("Project not found");
          // Don't navigate away immediately, let user see the error
          setLoading(false);
          return;
        }

        // Fetch available users
        const usersResponse = await axios.get(
          `${API_BASE_URL}/api/admin/${projectId}/available-users`
        );
        setUsers(usersResponse.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        const errorMessage = error.response?.data?.detail || error.message || "Failed to load data";
        toast.error(errorMessage);
        // If it's a 404 or project not found, don't navigate away
        if (error.response?.status === 404) {
          setLoading(false);
          return;
        }
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchData();
    }
  }, [projectId]);

  const toggleUserSelection = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id)
        ? prev.filter((userId) => userId !== id)
        : [...prev, id]
    );
  };

  const filteredUsers = users.filter((user) => {
    const query = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  });

  const handleAddUsers = async () => {
    if (selectedUsers.length === 0) {
      toast.warning("Please select at least one user to add");
      return;
    }

    if (!projectName) {
      toast.error("Project name not found");
      return;
    }

    setSubmitting(true);

    try {
      // Format the request according to the backend endpoint
      const payload = {
        project_name: projectName,
        members: selectedUsers.map((userId) => ({
          user_id: userId,
          project_role: "annotator", // Default role as per backend
        })),
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/admin/add_project_members`,
        payload
      );

      toast.success(response.data.message || "Users added successfully!");
      

      setTimeout(() => {
        setSelectedUsers([]);
      }, 200)
      // Clear selections and refresh the user list
      setSelectedUsers([]);
      
      // Optionally refresh the available users list
      const usersResponse = await axios.get(
        `${API_BASE_URL}/api/admin/${projectId}/available-users`
      );
      setUsers(usersResponse.data);
      
    } catch (error) {
      console.error("Error adding users:", error);
      const errorMessage = error.response?.data?.detail || error.message || "Failed to add users";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((u) => u.id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-black via-neutral-900 to-gray-900 text-amber-100">
        <div className="flex items-center gap-3">
          <Loader2 className="animate-spin text-amber-400" size={32} />
          <span className="text-amber-300 text-lg">Loading users...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-black via-neutral-900 to-gray-900 text-amber-100">
      {/* Back Button */}
      <button
        onClick={() =>
          navigate("/admin", { state: { activeView: "ongoingProjects" } })
        }
        className="mb-6 px-4 py-2 bg-amber-900/40 border border-amber-600 text-amber-200 rounded-lg hover:bg-amber-800/50 transition flex items-center gap-2 shadow-lg"
      >
        <ArrowLeft size={18} />
        Back to Admin Dashboard
      </button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent mb-2 flex items-center gap-3">
          <UserPlus className="text-amber-400" size={38} />
          Add Users to Project
        </h1>
        <p className="text-amber-300/70 text-sm">
          Project: <span className="font-semibold text-amber-200">{projectName || `ID: ${projectId}`}</span>
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400/60" size={20} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900/60 border border-amber-500/30 text-amber-200 placeholder-amber-400/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
          />
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-900/80 to-black/70 rounded-2xl p-8 border border-amber-500/20 shadow-xl text-center">
          <p className="text-amber-300/70 text-lg">
            {searchTerm ? "No users found matching your search." : "No available users to add."}
          </p>
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
                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                        onChange={toggleSelectAll}
                        className="h-5 w-5 cursor-pointer accent-amber-500"
                      />
                    </th>
                    <th className="p-4 text-left text-amber-300 font-semibold">User ID</th>
                    <th className="p-4 text-left text-amber-300 font-semibold">Name</th>
                    <th className="p-4 text-left text-amber-300 font-semibold">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className={`border-b border-amber-700/20 transition-colors ${
                        selectedUsers.includes(user.id)
                          ? "bg-amber-900/30"
                          : "hover:bg-amber-900/10"
                      }`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="h-5 w-5 cursor-pointer accent-amber-500"
                        />
                      </td>
                      <td className="p-4 text-amber-100 font-medium">{user.id}</td>
                      <td className="p-4 text-amber-200">{user.name}</td>
                      <td className="p-4 text-amber-300/80">{user.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Selected Count */}
          {selectedUsers.length > 0 && (
            <div className="mb-6 p-4 bg-gradient-to-r from-amber-900/30 to-amber-800/20 rounded-xl border border-amber-600/30 shadow-lg">
              <p className="text-amber-200 font-semibold flex items-center gap-2">
                <CheckCircle2 size={18} />
                {selectedUsers.length} user{selectedUsers.length > 1 ? "s" : ""} selected
              </p>
            </div>
          )}

          {/* Add Button */}
          <div className="flex justify-end">
            <button
              onClick={handleAddUsers}
              disabled={submitting || selectedUsers.length === 0}
              className="px-8 py-3 bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-semibold rounded-xl hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  Add {selectedUsers.length > 0 ? `${selectedUsers.length} ` : ""}User{selectedUsers.length !== 1 ? "s" : ""}
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};


export default AddUserPage;
