// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useParams, useNavigate } from "react-router-dom";

// const API_BASE_URL = "http://localhost:8000";

// const RandomReviewFiles = () => {
//   const { projectId, employeeId } = useParams();
//   const navigate = useNavigate();

//   const [files, setFiles] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [assigning, setAssigning] = useState(false);

//   useEffect(() => {
//   const fetchAssignedFiles = async () => {
//     try {
//       setLoading(true);

//       const res = await axios.get(
//         ${API_BASE_URL}/api/reviewer/review-files/${projectId}/${employeeId}
//       );

//       const allFiles = res.data.files || [];

//       // 🔥 Only keep files assigned by random
//       const filtered = allFiles.filter(
//         (f) => f.assigned_by_review === "random"
//       );

//       setFiles(filtered);
//     } catch (err) {
//       console.error("Error loading assigned review files", err);
//       setError("Could not load assigned review files.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   fetchAssignedFiles();
// }, [projectId, employeeId]);



//   const handleGetRandomReviewFile = async () => {
//     try {
//       setAssigning(true);

//       const res = await axios.get(
//         ${API_BASE_URL}/api/reviewer/review/assign-random/${projectId}/${employeeId}
//       );

//       const file = res.data.file;
//       if (!file) {
//         alert("No random review files available.");
//         return;
//       }

//       navigate(/reviewer/annotate/start/${projectId}/${file.file_id}, {
//         state: { imageUrl: file.object_url },
//       });
//     } catch (err) {
//       console.error("Error assigning random review file", err);
//       alert("No random review files available.");
//     } finally {
//       setAssigning(false);
//     }
//   };

//   const handleStart = (fileId, objectUrl) => {
//     navigate(/reviewer/annotate/start/${projectId}/${fileId}, {
//       state: { imageUrl: objectUrl },
//     });
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen text-gray-600 text-lg">
//         Loading review files…
//       </div>
//     );
//   }

//   if (error) {
//     return <div className="text-center text-red-500 mt-10">{error}</div>;
//   }

//   if (files.length === 0) {
//     return (
//       <div className="flex flex-col items-center justify-center h-[70vh]">
//         <h2 className="text-2xl font-semibold text-gray-800 mb-4">
//           No Review Files Assigned Yet
//         </h2>
//         <p className="text-gray-500 mb-6">
//           Click the button below to get a random review file.
//         </p>

//         <button
//           onClick={handleGetRandomReviewFile}
//           disabled={assigning}
//           className="px-8 py-3 rounded-xl bg-indigo-600 text-white text-lg shadow-md hover:bg-indigo-700 disabled:opacity-60"
//         >
//           {assigning ? "Assigning…" : "Get Random Review File"}
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-6xl mx-auto mt-12 space-y-1">
//       <h2 className="text-3xl text-green-700 font-semibold mb-6">
//         Assigned Review Files
//       </h2>

//       <div className="overflow-hidden bg-white shadow-xl rounded-2xl border border-gray-200">
//         <table className="min-w-full text-sm text-left border-collapse">
//           <thead className="bg-gray-100 text-gray-700 text-sm uppercase tracking-wide">
//             <tr>
//               <th className="px-6 py-4 font-semibold">File ID</th>
//               <th className="px-6 py-4 font-semibold">Status</th>
//               <th className="px-6 py-4 font-semibold">Review Cycle</th>
//               <th className="px-6 py-4 font-semibold">Preview</th>
//               <th className="px-6 py-4 text-center font-semibold">Action</th>
//             </tr>
//           </thead>

//           <tbody className="divide-y divide-gray-200">
//             {files.map((file) => {
//               const rc = file.review_cycle;

//               const statusLabel =
//                 rc === 1 ? "Fresh File" : rc > 1 ? "Rejected File" : "Unknown";

//               const statusColor =
//                 rc === 1
//                   ? "bg-green-100 text-green-700"
//                   : "bg-red-100 text-red-700";

//               return (
//                 <tr key={file.file_id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 font-medium">{file.file_id}</td>

//                   {/* STATUS BADGE */}
//                   <td className="px-6 py-4">
//                     <span
//                       className={px-3 py-1 rounded-full text-xs font-semibold ${statusColor}}
//                     >
//                       {statusLabel}
//                     </span>
//                   </td>

//                   <td className="px-6 py-4 font-semibold">{file.review_cycle}</td>

//                   <td className="px-6 py-4">
//                     <a
//                       href={file.object_url}
//                       target="_blank"
//                       rel="noreferrer"
//                       className="text-blue-600 hover:underline"
//                     >
//                       View File
//                     </a>
//                   </td>

//                   <td className="px-6 py-4 text-center">
//                     <button
//                       onClick={() =>
//                         handleStart(file.file_id, file.object_url)
//                       }
//                       className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
//                     >
//                       Start
//                     </button>
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default RandomReviewFiles;




import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:8000";

const RandomReviewFiles = () => {
  const { projectId, employeeId } = useParams();
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
  const fetchAssignedFiles = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${API_BASE_URL}/api/reviewer/review-files/${projectId}/${employeeId}`
      );

      const allFiles = res.data.files || [];

      // 🔥 Only keep files assigned by random
      const filtered = allFiles.filter(
        (f) => f.assigned_by_review === "random"
      );

      setFiles(filtered);
    } catch (err) {
      console.error("Error loading assigned review files", err);
      setError("Could not load assigned review files.");
    } finally {
      setLoading(false);
    }
  };

  fetchAssignedFiles();
}, [projectId, employeeId]);



  const handleGetRandomReviewFile = async () => {
    try {
      setAssigning(true);

      const res = await axios.get(
        `${API_BASE_URL}/api/reviewer/review/assign-random/${projectId}/${employeeId}`
      );

      const file = res.data.file;
      if (!file) {
        alert("No random review files available.");
        return;
      }

      navigate(`/reviewer/annotate/start/${projectId}/${file.file_id}`, {
        state: { imageUrl: file.object_url },
      });
    } catch (err) {
      console.error("Error assigning random review file", err);
      alert("No random review files available.");
    } finally {
      setAssigning(false);
    }
  };

  const handleStart = (fileId, objectUrl) => {
    navigate(`/reviewer/annotate/start/${projectId}/${fileId}`, {
      state: { imageUrl: objectUrl },
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600 text-lg">
        Loading review files…
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          No Review Files Assigned Yet
        </h2>
        <p className="text-gray-500 mb-6">
          Click the button below to get a random review file.
        </p>

        <button
          onClick={handleGetRandomReviewFile}
          disabled={assigning}
          className="px-8 py-3 rounded-xl bg-indigo-600 text-white text-lg shadow-md hover:bg-indigo-700 disabled:opacity-60"
        >
          {assigning ? "Assigning…" : "Get Random Review File"}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-12 space-y-1">
      <h2 className="text-3xl text-green-700 font-semibold mb-6">
        Assigned Review Files
      </h2>

      <div className="overflow-hidden bg-white shadow-xl rounded-2xl border border-gray-200">
        <table className="min-w-full text-sm text-left border-collapse">
          <thead className="bg-gray-100 text-gray-700 text-sm uppercase tracking-wide">
            <tr>
              <th className="px-6 py-4 font-semibold">File ID</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Review Cycle</th>
              <th className="px-6 py-4 font-semibold">Preview</th>
              <th className="px-6 py-4 text-center font-semibold">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {files.map((file) => {
              const rc = file.review_cycle;

              const statusLabel =
                rc === 1 ? "Fresh File" : rc > 1 ? "Rejected File" : "Unknown";

              const statusColor =
                rc === 1
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700";

              return (
                <tr key={file.file_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{file.file_id}</td>

                  {/* STATUS BADGE */}
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}
                    >
                      {statusLabel}
                    </span>
                  </td>

                  <td className="px-6 py-4 font-semibold">{file.review_cycle}</td>

                  <td className="px-6 py-4">
                    <a
                      href={file.object_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View File
                    </a>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() =>
                        handleStart(file.file_id, file.object_url)
                      }
                      className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Start
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RandomReviewFiles;

