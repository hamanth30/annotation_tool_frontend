import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

const ViewProjects = () => {
  const [projects, setProjects] = useState([]);
  const [expandedProject, setExpandedProject] = useState(null);
  const [viewMoreProject, setViewMoreProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch projects from backend
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/admin/get_all_projects`);
        setProjects(response.data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const toggleDetails = (projectId) => {
    setExpandedProject(expandedProject === projectId ? null : projectId);
    setViewMoreProject(null); // reset when closing
  };

  const handleViewMore = (projectId) => {
    setViewMoreProject(viewMoreProject === projectId ? null : projectId);
  };

  const handleAddUser = (project) => {
    console.log("Add User for project:", project);
  };

  const handleRemoveUser = (project) => {
    console.log("Remove User for project:", project);
  };

  const handleAssignFile = (project) => {
    console.log("Assign File for project:", project);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading projects...
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center text-gray-600 mt-10">
        No projects found.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 space-y-4">
      <h2 className="text-3xl font-bold text-indigo-600 text-center mb-6">
        All Projects
      </h2>

      {projects.map((project) => (
        <div
          key={project.id}
          className="bg-white shadow-md rounded-lg border border-gray-200 p-4 flex flex-col hover:shadow-lg transition-shadow duration-200"
        >
          {/* Compact project row */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                {project.name}
              </h3>
              <p className="text-sm text-gray-500">Project ID: {project.id}</p>
            </div>

            <button
              onClick={() => toggleDetails(project.id)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200"
            >
              {expandedProject === project.id ? "Hide Actions" : "View Actions"}
            </button>
          </div>

          {/* Action buttons appear only after pressing View Actions */}
          {expandedProject === project.id && (
            <div className="mt-4 border-t border-gray-200 pt-4 text-gray-700 space-y-3">
              <div className="flex flex-wrap gap-3 mb-2">
                <button
                  onClick={() => handleViewMore(project.id)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200"
                >
                  {viewMoreProject === project.id
                    ? "Hide Details"
                    : "View More Details"}
                </button>
                <button
                  onClick={() => handleAddUser(project)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200"
                >
                  Add User
                </button>
                <button
                  onClick={() => handleRemoveUser(project)}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200"
                >
                  Remove User
                </button>
                <button
                  onClick={() => handleAssignFile(project)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition duration-200"
                >
                  Assign File
                </button>
              </div>

              {/* Show project details only after pressing View More Details */}
              {viewMoreProject === project.id && (
                <div className="mt-3 border-t border-gray-100 pt-3 space-y-1">
                  <p>
                    <span className="font-medium text-gray-800">Description:</span>{" "}
                    {project.description || "No description available."}
                  </p>
                  <p>
                    <span className="font-medium text-gray-800">Classes:</span>{" "}
                    {project.classes || "None"}
                  </p>
                  <p>
                    <span className="font-medium text-gray-800">Created At:</span>{" "}
                    {new Date(project.created_at).toLocaleString()}
                  </p>
                  <p>
                    <span className="font-medium text-gray-800">Updated At:</span>{" "}
                    {new Date(project.updated_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ViewProjects;
