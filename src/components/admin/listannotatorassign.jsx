



import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ProjectFiles() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [rawFiles, setRawFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  // store FILE IDs here, not URL
  const [selectedFileIds, setSelectedFileIds] = useState([]);

  const apiBase = "http://localhost:8000/api/admin";

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiBase}/projects/${projectId}/files`);
      const raw = res.data?.working_directory?.raw || [];
      setRawFiles(raw);
    } catch (err) {
      console.error("Error fetching files:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFiles();
  }, [projectId]);

  const toggleFileSelection = (fileId) => {
    setSelectedFileIds((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId]
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* BACK BUTTON */}
      <button
        onClick={() => navigate("/admin/ongoingprojects")}
        className="mb-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 shadow"
      >
        <span className="text-xl">←</span> Back
      </button>

      <h2 className="text-3xl font-extrabold text-gray-800 mb-6">
        Assign Files — Project {projectId}
      </h2>

      {loading && <p className="text-gray-500 text-lg">Loading files...</p>}

      {!loading && rawFiles.length === 0 && (
        <p className="text-gray-500 text-lg">No raw files found.</p>
      )}

      {/* FILE GRID */}
      {!loading && rawFiles.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {rawFiles.map((file, idx) => {
            const { file_id, object_url, filename } = file;

            return (
              <div
                key={idx}
                className="p-4 bg-white rounded-xl shadow hover:shadow-lg transition border border-gray-100"
              >
                {/* IMAGE */}
                <a href={object_url} target="_blank" rel="noopener noreferrer">
                  <img
                    src={object_url}
                    alt=""
                    className="w-full h-40 object-cover rounded-lg mb-4 border"
                  />
                </a>

                {/* FILENAME */}
                <p className="font-medium text-gray-700 mb-2 truncate">
                  {filename}
                </p>

                {/* SELECT CHECKBOX */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedFileIds.includes(file_id)}
                      onChange={() => toggleFileSelection(file_id)}
                      className="h-5 w-5 accent-indigo-600"
                    />
                    <span className="text-gray-700">Select</span>
                  </label>

                  <a
                    href={object_url}
                    target="_blank"
                    className="text-indigo-600 text-sm underline"
                  >
                    Open
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ASSIGN BUTTON */}
      {selectedFileIds.length > 0 && (
        <div className="mt-8 flex justify-end">
          {/* <button
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow"
            onClick={() => {
              console.log("Selected File IDs:", selectedFileIds);
              //navigate(`/admin/viewannotatorsinaproject/${projectId}`);
              navigate(`/admin/viewannotatorsinaproject/${projectId}`, {
                state: {
                  selectedFileIds: selectedFileIds,
                },
              });

            }}
          >
            Assign {selectedFileIds.length} File(s)
          </button> */}
          <button
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow"
            onClick={() => {
              console.log("Selected File IDs:", selectedFileIds);
              navigate(`/admin/assignfileannotatortable/${projectId}`, {
                state: { selectedFileIds }
              });
            }}
          >
            Assign {selectedFileIds.length} File(s)
          </button>

        </div>
      )}
    </div>
  );
}
