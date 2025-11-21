import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:8000";

const RandomAssignedFiles = () => {
  const { projectId, employeeId } = useParams();
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assigning, setAssigning] = useState(false);

  // Fetch already assigned files
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_BASE_URL}/api/employee/user/${employeeId}/assigned-files`
        );

        const filtered = response.data.filter(
          (file) =>
            file.project_id == projectId && file.assigned_by === "random"
        );

        setFiles(filtered);
      } catch (err) {
        setError("Unable to load random assigned files.");
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [projectId, employeeId]);

  // Request a new random file
// Request a new random file
const handleGetRandomFile = async () => {
  try {
    setAssigning(true);

    const res = await axios.get(
      `${API_BASE_URL}/api/employee/${projectId}/assign-file/${employeeId}`
    );

    const assigned = res.data;

    // Safely extract fileId regardless of backend key name
    const extractedFileId =
      assigned.file_id || assigned.fileId || assigned.id;

    if (!extractedFileId) {
      alert("No more random files available for this project.");
      return;
    }

    // Navigate to annotation screen for that specific file
    navigate(
      `/employee/annotate/random/start/${projectId}/${extractedFileId}`
    );
  } catch (err) {
    alert("No more random files available for this project.");
  } finally {
    setAssigning(false);
  }
};


  const handleStart = (fileId) => {
    navigate(`/employee/annotate/random/start/${projectId}/${fileId}`);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-500 text-lg">
        Loading assigned files…
      </div>
    );

  if (error)
    return (
      <div className="text-center text-red-500 mt-10 font-medium">{error}</div>
    );

  // If NO files assigned yet
  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          No Random Files Assigned Yet
        </h2>
        <p className="text-gray-500 mb-6">
          Click below to get a new random file for this project.
        </p>

        <button
          onClick={handleGetRandomFile}
          disabled={assigning}
          className="px-8 py-3 rounded-xl bg-indigo-600 text-white text-lg font-medium shadow-md hover:bg-indigo-700 transition disabled:opacity-60"
        >
          {assigning ? "Assigning…" : "Get Random File"}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-12">
      <h2 className="text-3xl font-semibold mb-6">Random Assigned Files</h2>

      <div className="overflow-hidden bg-white shadow-xl rounded-2xl border border-gray-200">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700 text-sm uppercase tracking-wide">
              <th className="px-6 py-4">File ID</th>
              <th className="px-6 py-4">Filename</th>
              <th className="px-6 py-4">Assigned At</th>
              <th className="px-6 py-4">Status</th>
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
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {file.filename}
                  </a>
                </td>

                <td className="px-6 py-4">
                  {new Date(file.assigned_at).toLocaleString()}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      file.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {file.status}
                  </span>
                </td>

                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => handleStart(file.file_id)}
                    className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium shadow-sm hover:bg-indigo-700 transition"
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

export default RandomAssignedFiles;
