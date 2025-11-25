import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE_URL = "http://localhost:8000";

const AddUserPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [projectName, setProjectName] = useState("");

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-amber-300">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500"></div>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 p-6">
      {/* Back Button */}
      <button
        onClick={() => navigate("/admin", { state: { activeView: "ongoingProjects" } })}
        className="mb-4 text-amber-400 hover:text-amber-300 flex items-center gap-2 transition-colors"
      >
        <span>←</span> Back to Admin Dashboard
      </button>

      <div className="mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent text-center mb-2">
          Add Users to Project
        </h2>
        <p className="text-amber-300 text-center text-lg">
          {projectName || `Project ID: ${projectId}`}
        </p>
      </div>

      {users.length === 0 ? (
        <div className="text-center text-amber-400/70 mt-10 text-lg">
          No available users to add to this project.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto shadow-xl rounded-xl border border-amber-500/30 bg-gradient-to-br from-gray-900/80 to-black/80">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-amber-500/20 to-yellow-600/20">
                <tr>
                  <th className="p-4 text-left text-amber-300 font-semibold">Select</th>
                  <th className="p-4 text-left text-amber-300 font-semibold">User ID</th>
                  <th className="p-4 text-left text-amber-300 font-semibold">Name</th>
                  <th className="p-4 text-left text-amber-300 font-semibold">Email</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-amber-500/20">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-amber-500/10 transition-colors"
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        className="h-5 w-5 cursor-pointer accent-amber-500"
                      />
                    </td>
                    <td className="p-4 text-amber-200 font-semibold">{user.id}</td>
                    <td className="p-4 text-amber-200/90">{user.name}</td>
                    <td className="p-4 text-amber-300/80">{user.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add User Button */}
          <div className="flex justify-between items-center mt-6">
            <div className="text-amber-300">
              {selectedUsers.length > 0 && (
                <span className="font-semibold">
                  {selectedUsers.length} user{selectedUsers.length !== 1 ? "s" : ""} selected
                </span>
              )}
            </div>
            <button
              onClick={handleAddUsers}
              disabled={submitting || selectedUsers.length === 0}
              className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
            >
              {submitting ? "Adding..." : "Add Selected Users"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AddUserPage;
