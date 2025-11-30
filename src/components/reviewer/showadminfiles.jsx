import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams , useNavigate} from "react-router-dom";

const API_BASE_URL = "http://localhost:8000";

const AssignedAdminFilesReviewer = () => {
  const { projectId } = useParams();
  const employeeId = localStorage.getItem("userId");
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        (f) => f.assigned_by_review === "admin"
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

  const handleStart = (fileId, objectUrl) => {

    console.log("hi from sarva",fileId, objectUrl,projectId)
    navigate(
    //   `/employee/annotate/random/start/${projectId}/${fileId}`,
    `/reviewer/annotate/start/${projectId}/${fileId}`,
      {
        state: { 
          imageUrl: objectUrl,
          from: "admin" 
        }
      }
    );
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading files...
      </div>
    );

  if (error)
    return (
      <div className="text-center text-red-500 mt-10 font-medium">
        {error}
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto mt-12">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-800">
          Admin Assigned Files
        </h2>
        <p className="text-gray-500 mt-1 text-sm">
          Project ID: <span className="font-medium">{projectId}</span>
        </p>
      </div>

      <div className="overflow-hidden bg-white shadow-xl rounded-2xl border border-gray-200">
        <table className="min-w-full border-collapse">
          {/* HEADER */}
          <thead>
            <tr className="bg-gray-100 text-gray-700 text-sm uppercase tracking-wide">
              <th className="px-6 py-4 text-left font-semibold">File ID</th>
              <th className="px-6 py-4 text-left font-semibold">Filename</th>
              
              <th className="px-6 py-4 text-left font-semibold">Status</th>
              <th className="px-6 py-4 text-center font-semibold">Action</th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody className="divide-y divide-gray-200">
            {files.map((file) => (
              <tr
                key={file.file_id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 text-gray-700">{file.file_id}</td>

                <td className="px-6 py-4">
                  <a
                    href={file.object_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {file.filename}
                  </a>
                </td>

                

                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      file.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {file.review_cycle === 1 ? "newly assigned" : "rejected file"}
                  </span>
                </td>

                <td className="px-6 py-4 text-center">
                  <button
                     onClick={() => handleStart(file.file_id, file.object_url)}
                    className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium shadow-sm hover:bg-indigo-700 transition"
                  >
                    Start
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {files.length === 0 && (
          <div className="text-center py-10 text-gray-500 text-lg">
            No files assigned by admin.
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignedAdminFilesReviewer;
