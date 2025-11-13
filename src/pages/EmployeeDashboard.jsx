// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import AnnotateFile from "../components/annotator/AnnotateFiles";

// const API_BASE_URL = "http://localhost:8000";

// const EmployeeDashboard = () => {
//   const [projects, setProjects] = useState([]);
//   const [expandedProject, setExpandedProject] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [selectedProjectId, setSelectedProjectId] = useState(null);

//   // ✅ Retrieve from localStorage
//   const userId = localStorage.getItem("userId");
//   const token = localStorage.getItem("token");
//   const name = localStorage.getItem("name");

//   // ✅ Fetch assigned projects
//   useEffect(() => {
//     const fetchUserProjects = async () => {
//       if (!userId || !token) {
//         setError("User not logged in. Please login again.");
//         setLoading(false);
//         return;
//       }

//       try {
//         setLoading(true);
//         const response = await axios.get(
//           `${API_BASE_URL}/api/employee/user_projects/${userId}`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );
//         console.log(response)
//         setProjects(response.data || []);
//       } catch (err) {
//         console.error("Error fetching assigned projects:", err);
//         if (err.response?.status === 404) {
//           setError("No projects assigned to you yet.");
//         } else if (err.response?.status === 401) {
//           setError("Session expired. Please log in again.");
//           localStorage.clear();
//           window.location.href = "/";
//         } else {
//           setError("Failed to load projects. Please try again later.");
//         }
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUserProjects();
//   }, [userId, token]);

//   // ✅ Expand/Collapse project details
//   const toggleDetails = (projectId) => {
//     setExpandedProject(expandedProject === projectId ? null : projectId);
//   };

//   // ✅ Annotate random file
//   const handleAnnotate = (projectId) => {
//     setSelectedProjectId(projectId);
//   };

//   // ✅ Show AnnotateFile screen if a project is selected
//   if (selectedProjectId) {
//     return (
//       <AnnotateFile
//         projectId={selectedProjectId}
//         onBack={() => setSelectedProjectId(null)}
//       />
//     );
//   }

//   // ✅ Loading and error states
//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen text-gray-500">
//         Loading your projects...
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="text-center text-red-500 mt-10 font-medium">{error}</div>
//     );
//   }

//   // ✅ Main Dashboard UI
//   return (
//     <div className="max-w-5xl mx-auto mt-10 space-y-4">
//       <h2 className="text-3xl font-bold text-indigo-600 text-center mb-2">
//         Employee Dashboard
//       </h2>
//       <p className="text-center text-gray-600 mb-6">
//         Welcome, <span className="font-semibold">{name || "Employee"}</span>
//       </p>

//       <h3 className="text-2xl font-semibold text-indigo-500 text-center mb-4">
//         View Assigned Projects
//       </h3>

//       {projects.length === 0 ? (
//         <p className="text-center text-gray-500">
//           You don’t have any assigned projects yet.
//         </p>
//       ) : (
//         projects.map((project) => (
//           <div
//             key={project.project_id}
//             className="bg-white shadow-md rounded-lg border border-gray-200 p-4 flex flex-col hover:shadow-lg transition-shadow duration-200"
//           >
//             {/* Compact Project Card */}
//             <div className="flex justify-between items-center">
//               <div>
//                 <h3 className="text-xl font-semibold text-gray-800">
//                   {project.name}
//                 </h3>
//                 <p className="text-sm text-gray-500">
//                   Project ID: {project.project_id}
//                 </p>
//               </div>

//               <button
//                 onClick={() => toggleDetails(project.project_id)}
//                 className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200"
//               >
//                 {expandedProject === project.project_id
//                   ? "Hide Details"
//                   : "View Details"}
//               </button>
//             </div>

//             {/* Expanded Project Details */}
//                     {expandedProject === project.project_id && (
//             <div className="mt-4 border-t border-gray-200 pt-4 text-gray-700">
//               <p>
//                 <span className="font-medium text-gray-800">Description:</span>{" "}
//                 {project.description || "No description available."}
//               </p>
//               <p>
//                 <span className="font-medium text-gray-800">Classes:</span>{" "}
//                 {Array.isArray(project.classes)
//                   ? project.classes.join(", ")
//                   : project.classes || "None"}
//               </p>
//               <p>
//                 <span className="font-medium text-gray-800">Created At:</span>{" "}
//                 {new Date(project.created_at).toLocaleString()}
//               </p>
//               <p>
//                 <span className="font-medium text-gray-800">Updated At:</span>{" "}
//                 {new Date(project.updated_at).toLocaleString()}
//               </p>

//               <div className="mt-4">
//                 <button
//                   onClick={() => handleAnnotate(project.project_id)}
//                   className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200"
//                 >
//                   Annotate Random File
//                 </button>
//               </div>
//             </div>
//           )}

//           </div>
//         ))
//       )}
//     </div>
//   );
// };

// export default EmployeeDashboard;


// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import AnnotateFile from "../components/annotator/AnnotateFiles";
// import { useNavigate } from "react-router-dom";

// const API_BASE_URL = "http://localhost:8000";

// const EmployeeDashboard = () => {
//   const [projects, setProjects] = useState([]);
//   const [expandedProject, setExpandedProject] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [selectedProjectId, setSelectedProjectId] = useState(null);

//   const navigate=useNavigate();

//   const userId = localStorage.getItem("userId");
//   const token = localStorage.getItem("token");
//   const name = localStorage.getItem("name");

//   // ✅ Fetch assigned projects
//   useEffect(() => {
//     const fetchUserProjects = async () => {
//       if (!userId || !token) {
//         setError("User not logged in. Please login again.");
//         setLoading(false);
//         return;
//       }

//       try {
//         setLoading(true);
//         const response = await axios.get(
//           `${API_BASE_URL}/api/employee/user_projects/${userId}`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );
//         console.log("Fetched user projects:", response.data);
//         setProjects(response.data || []);
//       } catch (err) {
//         console.error("Error fetching assigned projects:", err);
//         if (err.response?.status === 404) {
//           setError("No projects assigned to you yet.");
//         } else if (err.response?.status === 401) {
//           setError("Session expired. Please log in again.");
//           localStorage.clear();
//           window.location.href = "/";
//         } else {
//           setError("Failed to load projects. Please try again later.");
//         }
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUserProjects();
//   }, [userId, token]);

//   const toggleDetails = (projectId) => {
//     setExpandedProject(expandedProject === projectId ? null : projectId);
//   };

//   const handleAnnotate = (projectId) => {
//     setSelectedProjectId(projectId);
//   };

//   // ✅ Show AnnotateFile screen if a project is selected
//   if (selectedProjectId) {
//     // return (
//       // <AnnotateFile
//       //   projectId={selectedProjectId}
//       //   onBack={() => setSelectedProjectId(null)}
//       // />
//       navigate(`/employee/annotate/${selectedProjectId}`)
//     //);
//   }

//   // ✅ Loading and error states
//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen text-gray-500">
//         Loading your projects...
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="text-center text-red-500 mt-10 font-medium">{error}</div>
//     );
//   }

//   // ✅ Main Dashboard UI
//   return (
//     <div className="max-w-5xl mx-auto mt-10 space-y-4">
//       <h2 className="text-3xl font-bold text-indigo-600 text-center mb-2">
//         Employee Dashboard
//       </h2>
//       <p className="text-center text-gray-600 mb-6">
//         Welcome, <span className="font-semibold">{name || "Employee"}</span>
//       </p>

//       <h3 className="text-2xl font-semibold text-indigo-500 text-center mb-4">
//         View Assigned Projects
//       </h3>

//       {projects.length === 0 ? (
//         <p className="text-center text-gray-500">
//           You don’t have any assigned projects yet.
//         </p>
//       ) : (
//         projects.map((project) => (
//           <div
//             key={project.project_id}
//             className="bg-white shadow-md rounded-lg border border-gray-200 p-4 flex flex-col hover:shadow-lg transition-shadow duration-200"
//           >
//             {/* Compact Project Card */}
//             <div className="flex justify-between items-center">
//               <div>
//                 <h3 className="text-xl font-semibold text-gray-800">
//                   {project.name}
//                 </h3>
//                 <p className="text-sm text-gray-500">
//                   Project ID: {project.project_id}
//                 </p>
//               </div>

//               <button
//                 onClick={() => toggleDetails(project.project_id)}
//                 className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200"
//               >
//                 {expandedProject === project.project_id
//                   ? "Hide Details"
//                   : "View Details"}
//               </button>
//             </div>

//             {/* Expanded Project Details */}
//             {expandedProject === project.project_id && (
//               <div className="mt-4 border-t border-gray-200 pt-4 text-gray-700">
//                 <p>
//                   <span className="font-medium text-gray-800">Description:</span>{" "}
//                   {project.description || "No description available."}
//                 </p>

//                 <div className="mt-2">
//                   <span className="font-medium text-gray-800">Classes:</span>
//                   {Array.isArray(project.classes) && project.classes.length > 0 ? (
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
//                       {project.classes.map((cls, idx) => (
//                         <div
//                           key={idx}
//                           className="border border-gray-300 rounded-lg p-3 bg-gray-50"
//                         >
//                           <h4 className="text-lg font-semibold text-blue-700 mb-2">
//                             {cls.name || `Class ${idx + 1}`}
//                           </h4>

//                           {/* Attributes (dictionary form) */}
//                           {cls.attributes &&
//                           typeof cls.attributes === "object" &&
//                           Object.keys(cls.attributes).length > 0 ? (
//                             <ul className="space-y-1">
//                               {Object.entries(cls.attributes).map(
//                                 ([attrName, attrDetails], i) => (
//                                   <li
//                                     key={i}
//                                     className="text-sm text-gray-700 border-b border-gray-200 pb-1"
//                                   >
//                                     <strong>{attrName}</strong> —{" "}
//                                     {attrDetails.type}
//                                     {attrDetails.default && (
//                                       <> (default: {attrDetails.default})</>
//                                     )}
//                                     {attrDetails.allowed_values &&
//                                       attrDetails.allowed_values.length > 0 && (
//                                         <div className="text-gray-600 text-xs ml-2">
//                                           Allowed:{" "}
//                                           {attrDetails.allowed_values.join(", ")}
//                                         </div>
//                                       )}
//                                   </li>
//                                 )
//                               )}
//                             </ul>
//                           ) : (
//                             <p className="text-gray-500 text-sm italic">
//                               No attributes defined.
//                             </p>
//                           )}
//                         </div>
//                       ))}
//                     </div>
//                   ) : (
//                     <p className="text-gray-500 text-sm ml-2">None</p>
//                   )}
//                 </div>

//                 <p className="mt-2">
//                   <span className="font-medium text-gray-800">Created At:</span>{" "}
//                   {new Date(project.created_at).toLocaleString()}
//                 </p>
//                 <p>
//                   <span className="font-medium text-gray-800">Updated At:</span>{" "}
//                   {new Date(project.updated_at).toLocaleString()}
//                 </p>

//                 <div className="mt-4">
//                   <button
//                     onClick={() => handleAnnotate(project.project_id)}
//                     className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200"
//                   >
//                     Annotate Random File
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         ))
//       )}
//     </div>
//   );
// };

// export default EmployeeDashboard;












import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:8000";

const EmployeeDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [expandedProject, setExpandedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const name = localStorage.getItem("name");

  // ✅ Fetch assigned projects
  useEffect(() => {
    const fetchUserProjects = async () => {
      if (!userId || !token) {
        setError("User not logged in. Please login again.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(
          `${API_BASE_URL}/api/employee/user_projects/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Fetched user projects:", response.data);
        setProjects(response.data || []);
      } catch (err) {
        console.error("Error fetching assigned projects:", err);
        if (err.response?.status === 404) {
          setError("No projects assigned to you yet.");
        } else if (err.response?.status === 401) {
          setError("Session expired. Please log in again.");
          localStorage.clear();
          window.location.href = "/";
        } else {
          setError("Failed to load projects. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProjects();
  }, [userId, token]);

  const toggleDetails = (projectId) => {
    setExpandedProject(expandedProject === projectId ? null : projectId);
  };

  const handleAnnotate = (projectId) => {
    // ✅ Directly navigate to annotation page
    navigate(`/employee/annotate/${projectId}`);
  };

  // ✅ Loading and error states
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading your projects...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 mt-10 font-medium">{error}</div>
    );
  }

  // ✅ Main Dashboard UI
  return (
    <div className="max-w-5xl mx-auto mt-10 space-y-4">
      <h2 className="text-3xl font-bold text-indigo-600 text-center mb-2">
        Employee Dashboard
      </h2>
      <p className="text-center text-gray-600 mb-6">
        Welcome, <span className="font-semibold">{name || "Employee"}</span>
      </p>

      <h3 className="text-2xl font-semibold text-indigo-500 text-center mb-4">
        View Assigned Projects
      </h3>

      {projects.length === 0 ? (
        <p className="text-center text-gray-500">
          You don’t have any assigned projects yet.
        </p>
      ) : (
        projects.map((project) => (
          <div
            key={project.project_id}
            className="bg-white shadow-md rounded-lg border border-gray-200 p-4 flex flex-col hover:shadow-lg transition-shadow duration-200"
          >
            {/* Compact Project Card */}
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  {project.name}
                </h3>
                <p className="text-sm text-gray-500">
                  Project ID: {project.project_id}
                </p>
              </div>

              <button
                onClick={() => toggleDetails(project.project_id)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200"
              >
                {expandedProject === project.project_id
                  ? "Hide Details"
                  : "View Details"}
              </button>
            </div>

            {/* Expanded Project Details */}
            {expandedProject === project.project_id && (
              <div className="mt-4 border-t border-gray-200 pt-4 text-gray-700">
                <p>
                  <span className="font-medium text-gray-800">Description:</span>{" "}
                  {project.description || "No description available."}
                </p>

                <div className="mt-2">
                  <span className="font-medium text-gray-800">Classes:</span>
                  {Array.isArray(project.classes) && project.classes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                      {project.classes.map((cls, idx) => (
                        <div
                          key={idx}
                          className="border border-gray-300 rounded-lg p-3 bg-gray-50"
                        >
                          <h4 className="text-lg font-semibold text-blue-700 mb-2">
                            {cls.name || `Class ${idx + 1}`}
                          </h4>

                          {cls.attributes &&
                          typeof cls.attributes === "object" &&
                          Object.keys(cls.attributes).length > 0 ? (
                            <ul className="space-y-1">
                              {Object.entries(cls.attributes).map(
                                ([attrName, attrDetails], i) => (
                                  <li
                                    key={i}
                                    className="text-sm text-gray-700 border-b border-gray-200 pb-1"
                                  >
                                    <strong>{attrName}</strong> —{" "}
                                    {attrDetails.type}
                                    {attrDetails.default && (
                                      <> (default: {attrDetails.default})</>
                                    )}
                                    {attrDetails.allowed_values &&
                                      attrDetails.allowed_values.length > 0 && (
                                        <div className="text-gray-600 text-xs ml-2">
                                          Allowed:{" "}
                                          {attrDetails.allowed_values.join(", ")}
                                        </div>
                                      )}
                                  </li>
                                )
                              )}
                            </ul>
                          ) : (
                            <p className="text-gray-500 text-sm italic">
                              No attributes defined.
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm ml-2">None</p>
                  )}
                </div>

                <p className="mt-2">
                  <span className="font-medium text-gray-800">Created At:</span>{" "}
                  {new Date(project.created_at).toLocaleString()}
                </p>
                <p>
                  <span className="font-medium text-gray-800">Updated At:</span>{" "}
                  {new Date(project.updated_at).toLocaleString()}
                </p>

                <div className="mt-4">
                  <button
                    onClick={() => handleAnnotate(project.project_id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200"
                  >
                    Annotate Random File
                  </button>
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
