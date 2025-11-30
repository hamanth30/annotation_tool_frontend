

// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useParams, useNavigate } from "react-router-dom";

// const API_BASE_URL = "http://localhost:8000";

// const RandomAssignedFilesReview = () => {
//   const { projectId, employeeId } = useParams();
//   const navigate = useNavigate();

//   const [files, setFiles] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [assigning, setAssigning] = useState(false);

// //   // Fetch already assigned files
// //   useEffect(() => {
// //     const fetchFiles = async () => {
// //       try {
// //         setLoading(true);
// //         console.log("hiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii",projectId, employeeId)
// //         const response = await axios.get(
// //           `${API_BASE_URL}/api/reviewer/review-files/${projectId}/${employeeId}`
// //         );

// //         const filtered = response.data.filter(
// //           (file) =>
// //             file.project_id == projectId && 
// //             file.assigned_by === "random" &&
// //             file.status !== "completed" // Only show incomplete files
// //         );

// //         setFiles(filtered);
// //         console.log(files)
// //       } catch (err) {
// //         console.error("Error fetching files:", err);
// //         setError("Unable to load random assigned files.");
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     fetchFiles();
// //   }, [projectId, employeeId]);



// useEffect(() => {
//   const fetchFiles = async () => {
//     try {
//       setLoading(true);

//       const response = await axios.get(
//         `${API_BASE_URL}/api/reviewer/review-files/${projectId}/${employeeId}`
//       );

//       const allFiles = response.data?.files || [];

//       const filtered = allFiles.filter(
//         (file) =>
//           file.project_id == projectId &&
//           file.assigned_by === "random" &&
//           file.status !== "completed"
//       );

//       setFiles(filtered);
//       console.log(filtered);
//     } catch (err) {
//       console.error("Error fetching files:", err);
//       setError("Unable to load random assigned files.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   fetchFiles();
// }, [projectId, employeeId]);


//   // Request a new random file
//   const handleGetRandomFile = async () => {
//     try {
//       setAssigning(true);

//       const res = await axios.get(
//         `${API_BASE_URL}/api/reviewer/review/assign-random/${projectId}/${employeeId}`
//       );

//       const { file_id, file_url } = res.data;

//       if (!file_id || !file_url) {
//         alert("No more random files available for this project.");
//         return;
//       }

//       // Navigate with state containing the file URL
//       navigate(
//         `/employee/annotate/random/start/${projectId}/${file_id}`,
//         {
//           state: { 
//             imageUrl: file_url,
//             fromRandomAssign: true 
//           }
//         }
//       );
      
//     } catch (err) {
//       console.error("Error assigning file:", err);
//       alert("No more random files available for this project.");
//     } finally {
//       setAssigning(false);
//     }
//   };

//   // Start annotation for existing file
//   const handleStart = (fileId, objectUrl) => {

//     console.log("hi from sarva",fileId, objectUrl,projectId)
//     navigate(
//       `/employee/annotate/random/start/${projectId}/${fileId}`,
//       {
//         state: { 
//           imageUrl: objectUrl,
//           fromRandomAssign: true 
//         }
//       }
//     );
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen text-gray-500 text-lg">
//         Loading assigned files…
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="text-center text-red-500 mt-10 font-medium">{error}</div>
//     );
//   }

//   // If NO files assigned yet
//   if (files.length === 0) {
//     return (
//       <div className="flex flex-col items-center justify-center h-[70vh]">
//         <h2 className="text-2xl font-semibold text-gray-800 mb-4">
//           No Random Files Assigned Yet
//         </h2>
//         <p className="text-gray-500 mb-6">
//           Click below to get a new random file for this project.
//         </p>

//         <button
//           onClick={handleGetRandomFile}
//           disabled={assigning}
//           className="px-8 py-3 rounded-xl bg-indigo-600 text-white text-lg font-medium shadow-md hover:bg-indigo-700 transition disabled:opacity-60"
//         >
//           {assigning ? "Assigning…" : "Get Random File"}
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-6xl mx-auto mt-12 space-y-1">
//       <h2 className="text-3xl text-green-700 font-semibold mb-6">
//         Randomly Assigned Incomplete Files
//       </h2>
//       <div className="">
//         <h2 className="text-red-600 mb-6">
//           Complete all these files to get a new random file
//         </h2>
//       </div>

//       <div className="overflow-hidden bg-white shadow-xl rounded-2xl border border-gray-200">
//         <table className="min-w-full border-collapse">
//           <thead>
//             <tr className="bg-gray-100 text-gray-700 text-sm uppercase tracking-wide">
//               <th className="px-6 py-4">File ID</th>
//               <th className="px-6 py-4">Filename</th>
//               <th className="px-6 py-4">Assigned At</th>
//               <th className="px-6 py-4">Status</th>
//               <th className="px-6 py-4 text-center">Action</th>
//             </tr>
//           </thead>

//           <tbody className="divide-y divide-gray-200">
//             {files.map((file) => (
//               <tr key={file.file_id} className="hover:bg-gray-50">
//                 <td className="px-6 py-4">{file.file_id}</td>

//                 <td className="px-6 py-4">
//                   <a
//                     href={file.object_url}
//                     target="_blank"
//                     rel="noreferrer"
//                     className="text-blue-600 hover:underline font-medium"
//                   >
//                     {file.filename}
//                   </a>
//                 </td>

//                 <td className="px-6 py-4">
//                   {new Date(file.assigned_at).toLocaleString()}
//                 </td>

//                 <td className="px-6 py-4">
//                   <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
//                     {file.status}
//                   </span>
//                 </td>

//                 <td className="px-6 py-4 text-center">
//                   <button
//                     onClick={() => handleStart(file.file_id, file.object_url)}
//                     className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium shadow-sm hover:bg-indigo-700 transition"
//                   >
//                     Start
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default RandomAssignedFilesReview;















import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { FileText, ExternalLink, Play, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";

const API_BASE_URL = "http://localhost:8000";

const RandomReviewFiles = () => {
  const { projectId, employeeId } = useParams();
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assigning, setAssigning] = useState(false);

  // Fetch assigned files for this reviewer
  useEffect(() => {
    const fetchAssignedFiles = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get(
          `${API_BASE_URL}/api/reviewer/review-files/${projectId}/${employeeId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const data = res.data.files || [];
        setFiles(data);
      } catch (err) {
        console.error("Error loading assigned review files", err);
        setError("Could not load assigned review files.");
        toast.error("Failed to load review files.");
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedFiles();
  }, [projectId, employeeId]);

  // Assign random review file
  const handleGetRandomReviewFile = async () => {
    try {
      setAssigning(true);

      const res = await axios.get(
        `${API_BASE_URL}/api/reviewer/review/assign-random/${projectId}/${employeeId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const file = res.data.file;
      if (!file) {
        toast.warning("No random review files available.");
        return;
      }

      toast.success("File assigned successfully!");
      navigate(`/reviewer/annotate/start/${projectId}/${file.file_id}`, {
        state: { imageUrl: file.object_url },
      });
    } catch (err) {
      console.error("Error assigning random review file", err);
      toast.error("No random review files available.");
    } finally {
      setAssigning(false);
    }
  };

  const handleStart = (fileId, objectUrl) => {
    navigate(`/reviewer/annotate/start/${projectId}/${fileId}`, {
      state: { imageUrl: objectUrl },
    });
  };

  const getFileName = (url) => {
    if (!url) return "N/A";
    try {
      const urlParts = url.split("/");
      return urlParts[urlParts.length - 1] || "N/A";
    } catch {
      return "N/A";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-gray-900 flex justify-center items-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-amber-400 animate-spin mx-auto mb-4" />
          <p className="text-amber-200 text-lg">Loading review files…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-gray-900 flex justify-center items-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-400 text-lg font-medium mb-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-amber-600 text-black rounded-lg hover:bg-amber-500 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No assigned review files for this reviewer → show button
  if (files.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-lg">
          <div className="mb-6">
            <FileText className="w-20 h-20 text-amber-400/50 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-amber-200 mb-3">
              No Review Files Assigned Yet
            </h2>
            <p className="text-amber-300/70 text-lg">
              Click the button below to get a random review file for this project.
            </p>
          </div>

          <button
            onClick={handleGetRandomReviewFile}
            disabled={assigning}
            className="px-8 py-4 rounded-xl bg-amber-600 text-black text-lg font-semibold shadow-lg hover:bg-amber-500 hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2 mx-auto"
          >
            {assigning ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Assigning…
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Get Random Review File
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Assigned review files exist → show table
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-gray-900 text-amber-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-amber-200 mb-2 flex items-center gap-3">
                <FileText className="w-8 h-8 text-amber-400" />
                Assigned Review Files
              </h1>
              <p className="text-amber-300/60 text-sm">
                Project: <span className="font-semibold text-amber-200">{projectId}</span> | 
                Reviewer: <span className="font-semibold text-amber-200">{employeeId}</span>
              </p>
            </div>
            <button
              onClick={handleGetRandomReviewFile}
              disabled={assigning}
              className="px-5 py-2.5 rounded-lg bg-amber-600 text-black font-semibold hover:bg-amber-500 transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {assigning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Assigning…
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Get New File
                </>
              )}
            </button>
          </div>
          <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg px-4 py-3">
            <p className="text-amber-200 text-sm">
              <span className="font-semibold">{files.length}</span> file{files.length !== 1 ? "s" : ""} assigned for review
            </p>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-hidden rounded-xl border border-amber-600/40 shadow-2xl bg-black/40 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-amber-900/40 to-amber-800/20 border-b border-amber-700/50">
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-amber-200">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      File ID
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-amber-200">
                    File Name / URL
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-amber-200">
                    Review Cycle
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-amber-200">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-amber-800/30">
                {files.map((file, index) => (
                  <tr
                    key={file.file_id}
                    className={`transition-all duration-200 ${
                      index % 2 === 0
                        ? "bg-black/20 hover:bg-amber-900/20"
                        : "bg-black/30 hover:bg-amber-900/20"
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        <span className="text-amber-200 font-semibold">
                          #{file.file_id}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-amber-100 font-medium truncate max-w-md">
                            {getFileName(file.object_url)}
                          </p>
                          <a
                            href={file.object_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-amber-400 hover:text-amber-300 text-sm flex items-center gap-1 mt-1 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Open in new tab
                          </a>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-900/40 text-amber-200 border border-amber-700/50">
                        Cycle {file.review_cycle || "N/A"}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleStart(file.file_id, file.object_url)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-black font-semibold rounded-lg hover:bg-amber-500 transition-all shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                      >
                        <Play className="w-4 h-4" />
                        Start Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="bg-amber-900/10 border-t border-amber-700/30 px-6 py-3">
            <p className="text-amber-300/60 text-xs text-center">
              Click "Start Review" to begin reviewing annotations for each file
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RandomReviewFiles;