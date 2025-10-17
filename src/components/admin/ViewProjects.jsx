import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

const ViewProjects = () => {
  const [projects, setProjects] = useState([]);
  const [expandedProject, setExpandedProject] = useState(null);
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
          {/* Compact card row */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                {project.name}
              </h3>
              <p className="text-sm text-gray-500">Project ID: {project.id}</p>
            </div>

            <div className="text-sm text-gray-600">
              Team Members: —
            </div>

            <button
              onClick={() => toggleDetails(project.id)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200"
            >
              {expandedProject === project.id ? "Hide Details" : "View Details"}
            </button>
          </div>

          {/* Expanded project details */}
          {expandedProject === project.id && (
            <div className="mt-4 border-t border-gray-200 pt-4 text-gray-700">
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
              {/* Future fields */}
              <p>
                <span className="font-medium text-gray-800">Admin Name:</span>{" "}
                —
              </p>
              <p>
                <span className="font-medium text-gray-800">Admin ID:</span>{" "}
                —
              </p>
              <p>
                <span className="font-medium text-gray-800">Team Members:</span>{" "}
                —
              </p>
              <p>
                <span className="font-medium text-gray-800">
                  Files Uploaded by Admin:
                </span>{" "}
                —
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ViewProjects;
