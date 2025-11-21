import React, { useEffect, useState } from "react";
import axios from "axios";
import DrawRect from "./DrawRect";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const API_BASE_URL = "http://localhost:8000";
// Developer-provided local image (used only as a fallback for testing)
const FALLBACK_IMAGE = "/mnt/data/54dd16f9-f2e8-4a23-a945-cbcafe3c7d6f.png";

export default function AnnotateFile() {
  // route params: project_id required; file_id optional when resuming
  const { project_id, file_id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user_id = localStorage.getItem("userId");

  const [imageUrl, setImageUrl] = useState("");
  const [fileId, setFileId] = useState(null);
  const [rectData, setRectData] = useState([]); // each rect: { id, x, y, width, height, classes: { className, attribute } }
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // Helper: get assigned-files for user and return the matched file object (or null)
  const findAssignedFile = async (targetFileId) => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/employee/user/${user_id}/assigned-files`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!Array.isArray(res.data)) return null;
      const found = res.data.find((f) => String(f.file_id) === String(targetFileId));
      return found || null;
    } catch (err) {
      console.error("Failed to fetch user's assigned-files:", err);
      return null;
    }
  };

  // 1) Load either the exact assigned file (if file_id param exists) OR request a new random file
  useEffect(() => {
    const loadFile = async () => {
      setLoading(true);
      setError("");

      try {
        if (file_id) {
          // --- RESUME: load the exact assigned file (do NOT call assign-file endpoint) ---
          const assigned = await findAssignedFile(file_id);

          if (!assigned) {
            setError("Assigned file not found for this user. It might be moved/removed.");
            setLoading(false);
            return;
          }

          setImageUrl(assigned.object_url || assigned.file_url || "");
          setFileId(assigned.file_id);
        } else {
          // --- NEW: request a random file (this will assign it in backend) ---
          const res = await axios.get(
            `${API_BASE_URL}/api/employee/${project_id}/assign-file/${user_id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (res.data?.file_url) {
            setImageUrl(res.data.file_url);
            setFileId(res.data.file_id);
          } else {
            // fallback: use local test image if you want
            console.warn("No image URL returned from assign-file endpoint — using fallback (dev).");
            setError("Failed to fetch file URL. The assigned-file endpoint returned empty URL.");
            setFileId(res.data?.file_id || null);
            return;
          }
        }
      } catch (err) {
        console.error("Error loading file:", err);
        setError("Failed to load file. See console.");
      } finally {
        setLoading(false);
      }
    };

    if (!project_id || !user_id) {
      setError("Missing project or user info.");
      setLoading(false);
      return;
    }

    loadFile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project_id, file_id, user_id, token]);

  // 2) Load project classes (for sidebar)
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/employee/projects/${project_id}/classes`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        let data = res.data;
        if (typeof data === "string") {
          try {
            data = JSON.parse(data);
          } catch (e) {
            console.error("Project classes JSON parse error:", e);
          }
        }
        setClasses(data || []);
      } catch (err) {
        console.error("Failed to load classes", err);
      }
    };

    if (project_id) fetchClasses();
  }, [project_id, token]);

  // 3) Receive rects from DrawRect (controlled)
  const handleRectChange = (rects) => {
    // rects come from DrawRect and already include id and geometry
    // ensure each rect has classes field
    const normalized = rects.map((r) => ({
      ...r,
      classes: r.classes || { className: "", attribute: "" },
    }));
    setRectData(normalized);
  };

  // class/attribute handlers (by id)
  const handleClassChange = (id, value) => {
    setRectData((prev) =>
      prev.map((r) =>
        String(r.id) === String(id) ? { ...r, classes: { className: value, attribute: "" } } : r
      )
    );
  };
  const handleAttributeChange = (id, value) => {
    setRectData((prev) =>
      prev.map((r) =>
        String(r.id) === String(id) ? { ...r, classes: { ...(r.classes || {}), attribute: value } } : r
      )
    );
  };

  // 4) Save annotation (PUT)
const handleSaveAnnotation = async () => {
  if (!fileId) {
    toast.error("File ID missing.");
    return;
  }

  try {
    setIsSaving(true);

    const payload = {
      data: rectData.map((b) => ({
        id: String(b.id),
        x: Number(b.x),
        y: Number(b.y),
        width: Number(b.width),
        height: Number(b.height),
        classes: {
          className: b.classes?.className || "",
          attribute: b.classes?.attribute || ""
        }
      }))
    };

    await axios.put(
      `${API_BASE_URL}/api/employee/save_annotation/${fileId}`,
      payload,
      {
        headers: { 
          Authorization: `Bearer ${token}`, 
          "Content-Type": "application/json" 
        }
      }
    );

    toast.success("Saved!");
  } catch (err) {
    console.error("Save failed:", err);
    toast.error("Save failed.");
  } finally {
    setIsSaving(false);
  }
};


  // 5) Submit
const handleSubmitAnnotation = async () => {
  if (rectData.length === 0) {
    toast.warning("Draw at least one box before submitting.");
    return;
  }

  if (!window.confirm("Submit annotation for review?")) return;

  try {
    const payload = {
      project_id: project_id,   // UUID → string (CORRECT)
      file_id: Number(fileId),
      user_id: user_id          // string (CORRECT)
    };

    await axios.post(
      `${API_BASE_URL}/api/employee/submit`,
      payload,
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    toast.success("Submitted!");
    setTimeout(() => navigate("/employee"), 700);

  } catch (err) {
    console.error("Submit failed:", err);
    toast.error("Submit failed. Check console.");
  }
};


  // Delete by id (updates both canvas and sidebar)
  const handleDeleteRect = (id) => {
    setRectData((prev) => prev.filter((r) => String(r.id) !== String(id)));
    // propagate change to DrawRect by calling onChange (DrawRect is controlled)
    // (handleRectChange will be called when rectData prop updates,
    // but to be explicit, we can also call handleRectChange with new value)
    toast?.info ? toast.info("Box removed") : null;
  };

  // UI
  if (loading) return <div className="flex justify-center h-screen">Loading…</div>;
  if (error)
    return (
      <div className="text-center text-red-500 mt-10 font-medium">
        {error}
      </div>
    );
  if (!imageUrl)
    return (
      <div className="text-center text-red-500 mt-10 font-medium">
        No image to display.
      </div>
    );

  return (
    <div className="flex flex-row p-4 gap-4">
      {/* Canvas */}
      <div className="flex flex-col items-center">
        <button onClick={() => navigate(-1)} className="self-start mb-4 bg-gray-300 px-4 py-2 rounded">
          ← Back
        </button>
        <h2 className="text-2xl font-semibold text-indigo-600 mb-4">Annotating Project #{project_id}</h2>

        <DrawRect
          width={800}
          height={600}
          imageUrl={imageUrl}
          rectData={rectData}
          onChange={handleRectChange}
        />

        <div className="mt-6 w-full max-w-3xl">
  <h3 className="text-xl font-semibold text-gray-800 mb-3">
    Annotation Details
  </h3>

  {rectData.length === 0 ? (
    <p className="text-gray-500 text-sm">No boxes drawn yet.</p>
  ) : (
    <div className="overflow-hidden rounded-xl border border-gray-200 shadow-md">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-100 text-gray-700 font-semibold">
          <tr>
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">X</th>
            <th className="px-4 py-3">Y</th>
            <th className="px-4 py-3">Width</th>
            <th className="px-4 py-3">Height</th>
            <th className="px-4 py-3">Class</th>
            <th className="px-4 py-3">Attribute</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {rectData.map((box, index) => (
            <tr
              key={box.id}
              className={`${
                index % 2 === 0 ? "bg-white" : "bg-gray-50"
              } hover:bg-indigo-50 transition`}
            >
              <td className="px-4 py-3 font-medium text-gray-800">
                {index + 1}
              </td>
              <td className="px-4 py-3 text-gray-700">{box.x.toFixed(1)}</td>
              <td className="px-4 py-3 text-gray-700">{box.y.toFixed(1)}</td>
              <td className="px-4 py-3 text-gray-700">{box.width.toFixed(1)}</td>
              <td className="px-4 py-3 text-gray-700">{box.height.toFixed(1)}</td>
              <td className="px-4 py-3 font-semibold text-indigo-700">
                {box.classes?.className || "-"}
              </td>
              <td className="px-4 py-3 text-indigo-600">
                {box.classes?.attribute || "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>

        <div className="mt-4 space-x-2">
          <button onClick={handleSaveAnnotation} disabled={isSaving} className="bg-green-600 text-white px-4 py-2 rounded">
            {isSaving ? "Saving…" : "💾 Save for Review"}
          </button>
          <button onClick={handleSubmitAnnotation} className={`px-4 py-2 rounded text-white ${rectData.length === 0 ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"}`}>
            Submit Annotation
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 bg-gray-50 p-4 rounded-lg shadow-md overflow-auto">
        <h3 className="text-lg font-semibold mb-2">Box Settings</h3>
        {rectData.length === 0 ? (
          <p className="text-gray-500 text-sm">Draw a box to start.</p>
        ) : (
          rectData.map((rect) => {
            const cls = classes.find((c) => c.name === rect.classes?.className);
            const attributes = cls?.attributes?.color?.allowed_values || [];
            return (
              <div key={rect.id} className="mb-3 border-b pb-3 relative">
                <button onClick={() => handleDeleteRect(rect.id)} className="absolute top-0 right-0 text-red-500">✕</button>
                <div className="text-sm font-medium mb-2">Box {rectData.findIndex(r => String(r.id) === String(rect.id)) + 1}</div>

                <select
                  className="border rounded p-1 w-full mb-2"
                  value={rect.classes?.className || ""}
                  onChange={(e) => handleClassChange(rect.id, e.target.value)}
                >
                  <option value="">Select class</option>
                  {classes.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>

                {attributes.length > 0 && (
                  <select
                    className="border rounded p-1 w-full"
                    value={rect.classes?.attribute || ""}
                    onChange={(e) => handleAttributeChange(rect.id, e.target.value)}
                  >
                    <option value="">Select attribute</option>
                    {attributes.map((a) => <option key={a} value={a}>{a}</option>)}
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
