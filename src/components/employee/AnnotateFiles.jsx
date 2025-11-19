import React, { useEffect, useState } from "react";
import axios from "axios";
import DrawRect from "./DrawRect";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:8000";

export default function AnnotateFile() {
  const { project_id } = useParams();
  const navigate = useNavigate();

  const [imageUrl, setImageUrl] = useState("");
  const [fileId, setFileId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [classes, setClasses] = useState([]);
  const [rectData, setRectData] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const token = localStorage.getItem("token");
  const user_id = localStorage.getItem("userId");

  // ✅ Fetch random file from backend
  useEffect(() => {
    const fetchRandomFile = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${API_BASE_URL}/api/employee/${project_id}/assign-file/${user_id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data?.file_url) {
          setImageUrl(res.data.file_url);
          setFileId(res.data.file_id); // backend must return file_id
        } else {
          setError("No image available for annotation.");
        }
      } catch (err) {
        console.error("Error fetching image:", err);
        setError("Failed to load image.");
      } finally {
        setLoading(false);
      }
    };
    fetchRandomFile();
  }, [project_id, token, user_id]);

  // ✅ Fetch project classes (updated endpoint)
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/employee/projects/${project_id}/classes`
        );
        console.log("Fetched classes:", res.data);
        setClasses(res.data || []);
      } catch (err) {
        console.error("Error fetching classes:", err);
      }
    };
    fetchClasses();
  }, [project_id]);

  // ✅ Handle drawn rectangles
 const handleRectChange = (rects) => {
  const updatedRects = rects.map((r, index) => {
    const existing = rectData[index];
    return {
      ...r,
      classes: existing?.classes || { className: "", attribute: "" },
    };
  });
  setRectData(updatedRects);
};

  // ✅ Update class per box
const handleClassChange = (index, value) => {
  const updated = [...rectData];
  updated[index].classes = {
    ...updated[index].classes,
    className: value,
    attribute: "", // reset attribute
  };
  setRectData(updated);
};

  // ✅ Update attribute per box
const handleAttributeChange = (index, value) => {
  const updated = [...rectData];
  updated[index].classes = {
    ...updated[index].classes,
    attribute: value,
  };
  setRectData(updated);
};

  // ✅ Save annotation data to backend
 const handleSaveAnnotation = async () => {
  if (!fileId) {
    alert("File ID missing — please reload the page.");
    return;
  }

  try {
    setIsSaving(true);

    const payload = {
      data: rectData.map((box) => ({
        id: String(box.id),
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
        classes: {
          className: box.classes?.className || "",
          attribute: box.classes?.attribute || "",
        },
      })),
    };

    console.log("Saving annotation payload:", payload);

    const res = await axios.put(
      `${API_BASE_URL}/api/employee/save_annotation/${fileId}`,
      payload
    );

    alert("✅ " + res.data.message);
    console.log("Last saved at:", res.data.last_saved_at);
  } catch (err) {
    console.error("Error saving annotation:", err);
    alert("Error saving annotation data. Check console.");
  } finally {
    setIsSaving(false);
  }
};

  const handleBack = () => navigate(-1);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading image...
      </div>
    );

  if (error)
    return (
      <div className="text-center text-red-500 mt-10 font-medium">{error}</div>
    );

  return (
    <div className="flex flex-row p-4 gap-4">
      {/* Left: Canvas */}
      <div className="flex flex-col items-center">
        <button
          onClick={handleBack}
          className="self-start mb-4 bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition"
        >
          ← Back
        </button>

        <h2 className="text-2xl font-semibold text-indigo-600 mb-4">
          Annotating Project #{project_id}
        </h2>

        {imageUrl ? (
          <DrawRect
            width={800}
            height={600}
            imageUrl={imageUrl}
            onChange={handleRectChange}
          />
        ) : (
          <p className="text-gray-500">No image available for annotation.</p>
        )}

        {/* ✅ Save Button */}
        <button
          onClick={handleSaveAnnotation}
          disabled={isSaving}
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {isSaving ? "Saving..." : "💾 Save for Review"}
        </button>
      </div>

      {/* Right: Sidebar */}
      <div className="w-80 bg-gray-50 p-4 rounded-lg shadow-md overflow-auto">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">
          Annotation Details
        </h3>

        {rectData.length === 0 ? (
          <p className="text-gray-500 text-sm">
            Draw a box to start annotating.
          </p>
        ) : (
          rectData.map((rect, index) => {
            const currentClass = classes.find(
              (c) => c.name === rect.className
            );
            const attributes =
              currentClass?.attributes?.color?.allowed_values || [];

            return (
              <div key={index} className="mb-3 border-b pb-2">
                <div className="text-sm font-medium text-gray-600 mb-1">
                  Box {index + 1} ({Math.round(rect.x)}, {Math.round(rect.y)})
                </div>

                {/* Class Dropdown */}
                <select
                  className="border rounded p-1 w-full mb-2"
                  value={rect.className}
                  onChange={(e) =>
                    handleClassChange(index, e.target.value)
                  }
                >
                  <option value="">Select class</option>
                  {classes.map((cls) => (
                    <option key={cls.name} value={cls.name}>
                      {cls.name}
                    </option>
                  ))}
                </select>

                {/* Attribute Dropdown */}
                {attributes.length > 0 && (
                  <select
                    className="border rounded p-1 w-full"
                    value={rect.attribute}
                    onChange={(e) =>
                      handleAttributeChange(index, e.target.value)
                    }
                  >
                    <option value="">Select attribute</option>
                    {attributes.map((attr) => (
                      <option key={attr} value={attr}>
                        {attr}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
