import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:8000";

const EmployeeDashboard = () => {
  const employeeId = localStorage.getItem("userId");
  const [projects, setProjects] = useState([]);
  const [expandedProject, setExpandedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const name = localStorage.getItem("name");

  useEffect(() => {
    const fetchUserProjects = async () => {
      if (!userId || !token) {
        setError("User not logged in.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(
          `${API_BASE_URL}/api/employee/user_projects/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setProjects(response.data || []);
      } catch (err) {
        setError("Failed to load projects.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProjects();
  }, [userId, token]);

  const toggleDetails = (projectId) => {
    setExpandedProject(expandedProject === projectId ? null : projectId);
  };

  // Navigation handlers
  const handleAnnotateRandom = (projectId) =>
    navigate(`/employee/randomfiles/${projectId}/${userId}`);

  const handleAnnotateAdmin = (projectId) => {
    navigate(`/employee/adminfiles/${projectId}/${userId}`);
  };

  const handleReviewRandom = (projectId) =>
    navigate(`/reviewer/randomfiles/${projectId}/${userId}`);

  const handleReviewAdmin = (projectId) =>
    navigate(`/employee/review/admin/${projectId}`);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-500 animate-pulse">
        Loading your projects...
      </div>
    );

  if (error)
    return (
      <div className="text-center text-red-500 mt-10 font-medium">{error}</div>
    );

  return (
    <div className=" max-w-5xl mx-auto mt-10 space-y-6 px-4">
      <h2 className="text-4xl font-bold text-indigo-700 text-center mb-2 drop-shadow-sm animate-fadeIn">
        Employee Dashboard
      </h2>

      <p className="text-center text-gray-700 mb-6 animate-fadeIn delay-150">
        Welcome, <span className="font-semibold text-indigo-700">{name || "Employee"}</span>
      </p>

      {projects.length === 0 ? (
        <p className="text-center text-gray-500">You don’t have any assigned projects yet.</p>
      ) : (
        projects.map((project) => (
          <div
            key={project.project_id}
            className="bg-white shadow-lg rounded-xl border border-gray-200 p-6 transition-all duration-300 hover:shadow-2xl hover:border-indigo-300 animate-slideUp"
          >
            {/* ---------- HEADER ---------- */}
            <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4">
              <div className="min-w-0">
                <h3 className="text-xl font-semibold text-gray-900 truncate">
                  {project.name}
                </h3>
                <p className="text-sm text-gray-500 truncate">
                  Project ID: {project.project_id}
                </p>
              </div>

              {/* ROLE BADGE */}
              <span
                className={`px-3 py-1 rounded-lg font-semibold text-white text-sm shadow-sm whitespace-nowrap ${
                  project.role === "reviewer" ? "bg-purple-600" : "bg-green-600"
                }`}
              >
                {project.role.toUpperCase()}
              </span>

              {/* Toggle Button */}
              <button
                onClick={() => toggleDetails(project.project_id)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition shadow-sm hover:shadow-md"
              >
                {expandedProject === project.project_id ? "Hide Details" : "View Details"}
              </button>
            </div>

            {/* ---------- DETAILS ---------- */}
            {expandedProject === project.project_id && (
              <div className="mt-4 border-t border-gray-200 pt-4 animate-fadeIn">
                <p className="text-gray-700 mb-2">
                  <strong>Description:</strong> {project.description || "No description available."}
                </p>
                <p className="text-gray-700">
                  <strong>Created:</strong> {new Date(project.created_at).toLocaleString()}
                </p>
                <p className="text-gray-700 mb-3">
                  <strong>Updated:</strong> {new Date(project.updated_at).toLocaleString()}
                </p>

                {/* ACTION BUTTONS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                  <button
                    onClick={() => handleAnnotateRandom(project.project_id)}
                    className="bg-green-600 text-white py-2 px-3 rounded-lg shadow-sm hover:bg-green-700 hover:shadow-md transition"
                  >
                    Auto assigned file
                  </button>

                  <button
                    onClick={() => handleAnnotateAdmin(project.project_id)}
                    className="bg-green-700 text-white py-2 px-3 rounded-lg shadow-sm hover:bg-green-800 hover:shadow-md transition"
                  >
                    Admin assigned file
                  </button>

                  {project.role === "reviewer" && (
                    <>
                      <button
                        onClick={() => handleReviewRandom(project.project_id)}
                        className="bg-purple-600 text-white py-2 px-3 rounded-lg shadow-sm hover:bg-purple-700 hover:shadow-md transition"
                      >
                        Review Random
                      </button>

                      <button
                        onClick={() => handleReviewAdmin(project.project_id)}
                        className="bg-purple-700 text-white py-2 px-3 rounded-lg shadow-sm hover:bg-purple-800 hover:shadow-md transition"
                      >
                        Review Admin
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default EmployeeDashboard;
