import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ProjectUnassignedReviews() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [reviewFiles, setReviewFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const apiBase = "http://localhost:8000/api/admin";

  const fetchReviewFiles = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${apiBase}/project/${projectId}/unassigned-reviews`
      );

      const files = res.data?.unassigned_review_files || [];

      console.log("Unassigned files:", files);

      // Normalize: always store as array of strings (urls only)
      const normalized = files
        .map((item) => {
          if (typeof item === "string") return item;
          if (typeof item === "object" && item !== null) {
            return item.url || item.Location || item.signedUrl || null;
          }
          return null;
        })
        .filter(Boolean); // remove nulls

      setReviewFiles(normalized);
    } catch (err) {
      console.error("Error fetching unassigned review files:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReviewFiles();
  }, [projectId]);

  const toggleFileSelection = (fileUrl) => {
    setSelectedFiles((prev) =>
      prev.includes(fileUrl)
        ? prev.filter((f) => f !== fileUrl)
        : [...prev, fileUrl]
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

      {/* HEADER */}
      <h2 className="text-3xl font-extrabold text-gray-800 mb-6">
        Assign Review Files — Project {projectId}
      </h2>

      {loading && (
        <p className="text-gray-500 text-lg">Loading files...</p>
      )}

      {!loading && reviewFiles.length === 0 && (
        <p className="text-gray-500 text-lg">No unassigned review files.</p>
      )}

      {/* FILE GRID */}
      {!loading && reviewFiles.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {reviewFiles.map((url, idx) => {
            const filename =
              typeof url === "string"
                ? url.split("/").pop().split("?")[0]
                : "unknown-file";

            return (
              <div
                key={idx}
                className="p-4 bg-white rounded-xl shadow hover:shadow-lg transition border border-gray-100"
              >
                {/* IMAGE */}
                <a href={url} target="_blank" rel="noopener noreferrer">
                  <img
                    src={url}
                    alt=""
                    className="w-full h-40 object-cover rounded-lg mb-4 border"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/300x200?text=File";
                    }}
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
                      checked={selectedFiles.includes(url)}
                      onChange={() => toggleFileSelection(url)}
                      className="h-5 w-5 accent-indigo-600"
                    />
                    <span className="text-gray-700">Select</span>
                  </label>

                  <a
                    href={url}
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
      {selectedFiles.length > 0 && (
        <div className="mt-8 flex justify-end">
          <button
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow"
            onClick={() =>{
                navigate(`/admin/reviewfileassign/${projectId}`)
            }
              
            }
          >
            Assign {selectedFiles.length} Review File(s)
          </button>
        </div>
      )}
    </div>
  );
}
