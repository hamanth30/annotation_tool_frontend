import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:8000";

const ViewProjects = () => {
  const [projects, setProjects] = useState([]);
  const [expandedProject, setExpandedProject] = useState(null);
  const [viewMoreProject, setViewMoreProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/admin/get_all_projects`
        );
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
    setViewMoreProject(null);
  };

  const handleViewMore = (projectId) => {
    setViewMoreProject(viewMoreProject === projectId ? null : projectId);
  };

  const handleAssignFile = (project) => {
    navigate(`/admin/project/${project.id}/files`);
  };
  const handleAddUser=(project)=>{
    navigate(`/admin/project/${project.id}/add-users`)
  }

  const handleRemoveUser=(project)=>{
    navigate(`/admin/project/${project.id}/annotators`)
  }
  const handlePromoteReviewer=(project)=>{
     navigate(`/admin/project/${project.id}/promotereviewer`)
  }
  const handleAssignFileReviewer=(project)=>{
    navigate(`/admin/project/${project.id}/reviewfiles`)
  }
  
  


  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading projects...
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center text-gray-600 mt-10">No projects found.</div>
    );
  }

  const parseClasses = (classes) => {
    try {
      if (!classes) return [];
      return typeof classes === "string" ? JSON.parse(classes) : classes;
    } catch (err) {
      return [];
    }
  };

  return (
    <div className="max-w-7xl mx-auto mt-10 space-y-4 w-full">
      <h2 className="text-3xl font-bold text-indigo-600 text-center mb-6">
        All Projects
      </h2>

      {projects.map((project) => {
        const classList = parseClasses(project.classes);

        return (
          <div
            key={project.id}
            className="bg-white shadow-md rounded-lg border border-gray-200 p-4 flex flex-col hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  {project.name}
                </h3>
                <p className="text-sm text-gray-500">
                  Project ID: {project.id}
                </p>
              </div>

              <button
                onClick={() => toggleDetails(project.id)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200"
              >
                {expandedProject === project.id ? "Hide Actions" : "View Actions"}
              </button>
            </div>

            {expandedProject === project.id && (
              <div className="mt-4 border-t border-gray-200 pt-4 text-gray-700 space-y-3">
                <div className="flex flex-nowrap gap-3 overflow-x-auto pb-2">
                  <button
                    onClick={() => handleViewMore(project.id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200"
                  >
                    {viewMoreProject === project.id
                      ? "Hide Details"
                      : "View More Details"}
                  </button>

                  <button onClick={() => handleAddUser(project)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200">
                    Add User
                  </button>

                  <button  onClick={() => handleRemoveUser(project)}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200">
                    Remove User
                  </button>

                  <button
                    onClick={() => handleAssignFile(project)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition duration-200"
                  >
                    Assign File to Annotators
                  </button>

                  <button onClick={() => handlePromoteReviewer(project)}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition duration-200">
                    Promote Reviewers
                  </button>

                  <button onClick={() => handleAssignFileReviewer(project)}
                  className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition duration-200">
                    Assign File to Reviewers
                  </button>
                </div>

                {viewMoreProject === project.id && (
                  <div className="mt-3 border-t border-gray-100 pt-3 space-y-2">
                    <p>
                      <span className="font-medium text-gray-800">Description:</span>{" "}
                      {project.description || "No description available."}
                    </p>

                    <div>
                      <span className="font-medium text-gray-800">Classes:</span>
                      {classList.length === 0 ? (
                        <p className="text-gray-600">None</p>
                      ) : (
                        <ul className="list-disc ml-6 mt-1">
                          {classList.map((cls, idx) => (
                            <li key={idx} className="text-gray-800">
                              {cls.name}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

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
        );
      })}
    </div>
  );
};

export default ViewProjects;
