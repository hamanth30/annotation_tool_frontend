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
      <div className="flex justify-center items-center h-screen text-amber-300">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500"></div>
          <span>Loading projects...</span>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center text-amber-400/70 mt-10 text-lg">No projects found.</div>
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
    <div className="max-w-7xl mx-auto space-y-4 w-full">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent text-center mb-8">
        All Projects
      </h2>

      {projects.map((project) => {
        const classList = parseClasses(project.classes);

        return (
          <div
            key={project.id}
            className="bg-gradient-to-br from-gray-900/80 to-black/80 shadow-xl rounded-xl border border-amber-500/30 p-6 flex flex-col hover:shadow-2xl hover:border-amber-500/50 transition-all duration-300 backdrop-blur-sm"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-amber-200 mb-1">
                  {project.name}
                </h3>
                <p className="text-sm text-amber-400/70">
                  Project ID: {project.id}
                </p>
              </div>

              <button
                onClick={() => toggleDetails(project.id)}
                className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black px-5 py-2.5 rounded-xl transition-all duration-200 font-semibold shadow-lg shadow-amber-500/30"
              >
                {expandedProject === project.id ? "Hide Actions" : "View Actions"}
              </button>
            </div>

            {expandedProject === project.id && (
              <div className="mt-4 border-t border-amber-500/30 pt-4 space-y-3">
                <div className="flex flex-nowrap gap-3 overflow-x-auto pb-2">
                  <button
                    onClick={() => handleViewMore(project.id)}
                    className="bg-gradient-to-r from-amber-500/80 to-yellow-600/80 hover:from-amber-500 hover:to-yellow-600 text-black px-4 py-2 rounded-xl transition-all duration-200 font-semibold whitespace-nowrap shadow-md shadow-amber-500/20"
                  >
                    {viewMoreProject === project.id
                      ? "Hide Details"
                      : "View More Details"}
                  </button>

                  <button onClick={() => handleAddUser(project)}
                  className="bg-gradient-to-r from-emerald-600/80 to-green-600/80 hover:from-emerald-500 hover:to-green-500 text-white px-4 py-2 rounded-xl transition-all duration-200 font-semibold whitespace-nowrap shadow-md shadow-emerald-500/20">
                    Add User
                  </button>

                  <button  onClick={() => handleRemoveUser(project)}
                  className="bg-gradient-to-r from-red-600/80 to-red-700/80 hover:from-red-500 hover:to-red-600 text-white px-4 py-2 rounded-xl transition-all duration-200 font-semibold whitespace-nowrap shadow-md shadow-red-500/20">
                    Remove User
                  </button>

                  <button
                    onClick={() => handleAssignFile(project)}
                    className="bg-gradient-to-r from-purple-600/80 to-purple-700/80 hover:from-purple-500 hover:to-purple-600 text-white px-4 py-2 rounded-xl transition-all duration-200 font-semibold whitespace-nowrap shadow-md shadow-purple-500/20"
                  >
                    Assign File to Annotators
                  </button>

                  <button onClick={() => handlePromoteReviewer(project)}
                  className="bg-gradient-to-r from-yellow-500/80 to-amber-600/80 hover:from-yellow-400 hover:to-amber-500 text-black px-4 py-2 rounded-xl transition-all duration-200 font-semibold whitespace-nowrap shadow-md shadow-yellow-500/20">
                    Promote Reviewers
                  </button>

                  <button onClick={() => handleAssignFileReviewer(project)}
                  className="bg-gradient-to-r from-orange-600/80 to-orange-700/80 hover:from-orange-500 hover:to-orange-600 text-white px-4 py-2 rounded-xl transition-all duration-200 font-semibold whitespace-nowrap shadow-md shadow-orange-500/20">
                    Assign File to Reviewers
                  </button>
                </div>

                {viewMoreProject === project.id && (
                  <div className="mt-3 border-t border-amber-500/20 pt-3 space-y-3 bg-gray-900/30 rounded-lg p-4">
                    <p>
                      <span className="font-semibold text-amber-300">Description:</span>{" "}
                      <span className="text-amber-200/90">{project.description || "No description available."}</span>
                    </p>

                    <div>
                      <span className="font-semibold text-amber-300">Classes:</span>
                      {classList.length === 0 ? (
                        <p className="text-amber-400/70 ml-2">None</p>
                      ) : (
                        <ul className="list-disc ml-6 mt-2 space-y-1">
                          {classList.map((cls, idx) => (
                            <li key={idx} className="text-amber-200">
                              {cls.name}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <p>
                      <span className="font-semibold text-amber-300">Created At:</span>{" "}
                      <span className="text-amber-200/90">{new Date(project.created_at).toLocaleString()}</span>
                    </p>

                    <p>
                      <span className="font-semibold text-amber-300">Updated At:</span>{" "}
                      <span className="text-amber-200/90">{new Date(project.updated_at).toLocaleString()}</span>
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
