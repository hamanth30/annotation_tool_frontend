

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

        const res = await axios.get(
          `${API_BASE_URL}/api/reviewer/review-files/${projectId}/${employeeId}`
        );

        const data = res.data.files || [];

        setFiles(data);
      } catch (err) {
        console.error("Error loading assigned review files", err);
        setError("Could not load assigned review files.");
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

  // No assigned review files for this reviewer → show button
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

  // Assigned review files exist → show table
  return (
    <div className="max-w-6xl mx-auto mt-12 space-y-1">
      <h2 className="text-3xl text-green-700 font-semibold mb-6">
        Assigned Review Files
      </h2>

      <div className="overflow-hidden bg-white shadow-xl rounded-2xl border border-gray-200">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100 text-gray-700 text-sm uppercase tracking-wide">
              <th className="px-6 py-4">File ID</th>
              <th className="px-6 py-4">Object URL</th>
              <th className="px-6 py-4">Review Cycle</th>
              <th className="px-6 py-4 text-center">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {files.map((file) => (
              <tr key={file.file_id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{file.file_id}</td>

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

                <td className="px-6 py-4">{file.review_cycle}</td>

                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => handleStart(file.file_id, file.object_url)}
                    className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Start
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RandomReviewFiles;

