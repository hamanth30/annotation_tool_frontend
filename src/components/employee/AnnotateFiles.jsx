import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import DrawRect from "./DrawRect";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Pencil, Trash2 } from "lucide-react";

const API_BASE_URL = "http://localhost:8000";

// small util to safely read attributes structure (backend may vary)
const getAttributesForClass = (classes, className) => {
  const cls = classes.find((c) => c.name === className);
  if (!cls) return [];
  return Object.entries(cls.attributes || {}).map(([attrName, attrDef]) => ({
    attrName,
    allowedValues: (attrDef && attrDef.allowed_values) || (Array.isArray(attrDef) ? attrDef : []),
  }));
};

export default function AnnotateFile() {
  const { project_id, file_id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user_id = localStorage.getItem("userId");

  const [imageUrl, setImageUrl] = useState("");
  const [fileId, setFileId] = useState(null);
  const [rectData, setRectData] = useState([]); // rects with classes -> { className, attributeName, attributeValue }
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // Annotate panel + modal state
  const [annotateTab, setAnnotateTab] = useState("create"); // create | edit
  const [modalOpen, setModalOpen] = useState(false);
  const [modalBoxId, setModalBoxId] = useState(null);
  const [modalClass, setModalClass] = useState("");
  const [modalAttributeName, setModalAttributeName] = useState("");
  const [modalAttributeValue, setModalAttributeValue] = useState("");

  // Menu bar state
  const [menuOpen, setMenuOpen] = useState(null); // "general" | "edit" | "display" | "help" | null
  const [showTaskModal, setShowTaskModal] = useState(false);

  // Edit options state
  const [drawEnabled, setDrawEnabled] = useState(true); // toggled by "Drag object" in Edit menu

  // track previous rect count to detect new rects from DrawRect
  const prevCountRef = useRef(0);

  // ---------- Load file + classes ----------
  useEffect(() => {
    const loadFile = async () => {
      setLoading(true);
      setError("");
      try {
        if (file_id) {
          const res = await axios.get(
            `${API_BASE_URL}/api/employee/user/${user_id}/assigned-files`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const arr = Array.isArray(res.data) ? res.data : [];
          const assigned = arr.find((f) => String(f.file_id) === String(file_id));
          if (!assigned) {
            setError("Assigned file not found.");
            setLoading(false);
            return;
          }
          setImageUrl(assigned.object_url || assigned.file_url || "");
          setFileId(assigned.file_id);
        } else {
          const res = await axios.get(
            `${API_BASE_URL}/api/employee/${project_id}/assign-file/${user_id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (res.data?.file_url) {
            setImageUrl(res.data.file_url);
            setFileId(res.data.file_id);
          } else {
            setError("Failed to fetch file URL.");
            setFileId(res.data?.file_id || null);
            setLoading(false);
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
            data = [];
          }
        }
        setClasses(data || []);
      } catch (err) {
        console.error("Failed to load classes", err);
      }
    };
    if (project_id) fetchClasses();
  }, [project_id, token]);

  // ---------- Handle rect changes from DrawRect ----------
  const handleRectChange = (rects) => {
    const normalized = rects.map((r) => ({
      ...r,
      classes: r.classes || { className: "", attributeName: "", attributeValue: "" },
    }));

    const prevCount = prevCountRef.current || 0;
    if (normalized.length > prevCount) {
      const existingIds = new Set((rectData || []).map((r) => r.id));
      const added = normalized.find((r) => !existingIds.has(r.id));
      if (added) {
        setRectData(normalized);
        prevCountRef.current = normalized.length;
        openModalForBox(added.id);
        return;
      }
    }

    prevCountRef.current = normalized.length;
    setRectData(normalized);
  };

  // ---------- Modal helpers ----------
  const openModalForBox = (boxId) => {
    const box = rectData.find((r) => String(r.id) === String(boxId));
    if (!box) {
      setModalBoxId(boxId);
      setModalClass("");
      setModalAttributeName("");
      setModalAttributeValue("");
      setModalOpen(true);
      return;
    }
    setModalBoxId(boxId);
    setModalClass(box.classes?.className || "");
    setModalAttributeName(box.classes?.attributeName || "");
    setModalAttributeValue(box.classes?.attributeValue || "");
    setModalOpen(true);
    setAnnotateTab("edit");
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalBoxId(null);
    setModalClass("");
    setModalAttributeName("");
    setModalAttributeValue("");
  };

  const saveModalSelection = () => {
    if (!modalBoxId) return;
    setRectData((prev) =>
      prev.map((r) =>
        String(r.id) === String(modalBoxId)
          ? {
              ...r,
              classes: {
                className: modalClass,
                attributeName: modalAttributeName,
                attributeValue: modalAttributeValue,
              },
            }
          : r
      )
    );
    closeModal();
  };

  // ---------- Delete box (dustbin) ----------
  const handleDeleteBox = (boxId) => {
    // remove from rectData and update
    setRectData((prev) => {
      const updated = prev.filter((r) => String(r.id) !== String(boxId));
      prevCountRef.current = updated.length;
      return updated;
    });
    toast.info("Box removed.");
  };

  // ---------- Edit tab helpers ----------
  const onEditPencilClick = (boxId) => {
    openModalForBox(boxId);
  };

  // ---------- Menu actions ----------
  const openFileUrlInNewTab = () => {
    if (!imageUrl) {
      toast.error("No file URL available.");
      return;
    }
    window.open(imageUrl, "_blank");
  };

  const openTaskInfo = () => {
    // already shows project_id in header; open a modal that shows details
    setShowTaskModal(true);
  };

  const closeTaskInfo = () => setShowTaskModal(false);

  // ---------- Save / Submit ----------
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
            attributeName: b.classes?.attributeName || "",
            attributeValue: b.classes?.attributeValue || "",
          },
        })),
      };
      await axios.put(`${API_BASE_URL}/api/employee/save_annotation/${fileId}`, payload, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      toast.success("Saved!");
    } catch (err) {
      console.error("Save failed:", err);
      toast.error("Save failed.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitAnnotation = async () => {
    if (rectData.length === 0) {
      toast.warning("Draw at least one box before submitting.");
      return;
    }
    if (!window.confirm("Submit annotation for review?")) return;

    try {
      const payload = {
        project_id: project_id,
        file_id: Number(fileId),
        user_id: user_id,
      };

      await axios.post(`${API_BASE_URL}/api/employee/submit`, payload, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });

      toast.success("Submitted!");
      setTimeout(() => navigate("/employee"), 700);
    } catch (err) {
      console.error("Submit failed:", err);
      toast.error("Submit failed. Check console.");
    }
  };

  // ---------- Render ----------
  if (loading) return <div className="flex justify-center h-screen">Loading…</div>;
  if (error) return <div className="text-center text-red-500 mt-10 font-medium">{error}</div>;
  if (!imageUrl) return <div className="text-center text-red-500 mt-10 font-medium">No image to display.</div>;

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-black via-neutral-900 to-gray-900 text-amber-100">
      {/* ===== Top Menu Bar ===== */}
      <div className="max-w-[1400px] mx-auto mb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="text-xl font-bold text-amber-300">ANNOTATE</div>
            <nav className="flex gap-2">
              {/* General Menu */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((s) => (s === "general" ? null : "general"))}
                  className={`px-3 py-1 rounded-md ${menuOpen === "general" ? "bg-amber-700/20 border border-amber-500" : "bg-black/40 border border-amber-800/20"}`}
                >
                  General
                </button>
                {menuOpen === "general" && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-black/95 border border-amber-600 rounded-lg shadow-2xl z-50 overflow-hidden">
                    <div className="py-1">
                      <button onClick={openTaskInfo} className="w-full px-4 py-2.5 text-left text-amber-100 hover:bg-amber-600/20 hover:text-amber-200 transition-colors">
                        Task information
                      </button>
                      <button onClick={openFileUrlInNewTab} className="w-full px-4 py-2.5 text-left text-amber-100 hover:bg-amber-600/20 hover:text-amber-200 transition-colors">
                        File URL
                      </button>
                      <button onClick={() => toast.info("File name: sample_image.jpg (static)")} className="w-full px-4 py-2.5 text-left text-amber-100 hover:bg-amber-600/20 hover:text-amber-200 transition-colors">
                        File name
                      </button>
                      <button onClick={() => navigate(-1)} className="w-full px-4 py-2.5 text-left text-amber-100 hover:bg-amber-600/20 hover:text-amber-200 transition-colors">
                        Go to dashboard
                      </button>
                      <button onClick={() => toast.info("Break reminder (static)")} className="w-full px-4 py-2.5 text-left text-amber-100 hover:bg-amber-600/20 hover:text-amber-200 transition-colors">
                        Break Reminder
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Edit Menu */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((s) => (s === "edit" ? null : "edit"))}
                  className={`px-3 py-1 rounded-md ${menuOpen === "edit" ? "bg-amber-700/20 border border-amber-500" : "bg-black/40 border border-amber-800/20"}`}
                >
                  Edit
                </button>
                {menuOpen === "edit" && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-black/95 border border-amber-600 rounded-lg shadow-2xl z-50 overflow-hidden">
                    <div className="py-1">
                      <button
                        onClick={() => setDrawEnabled((v) => !v)}
                        className="w-full px-4 py-2.5 text-left text-amber-100 hover:bg-amber-600/20 hover:text-amber-200 transition-colors flex items-center justify-between"
                      >
                        <span>Toggle Drawing</span>
                        <span className={`text-xs px-2 py-1 rounded ${drawEnabled ? "bg-amber-600 text-black" : "bg-amber-900/40 text-amber-300"}`}>
                          {drawEnabled ? "ON" : "OFF"}
                        </span>
                      </button>
                      <button onClick={() => toast.info("Move object: drag box to move (already enabled)")} className="w-full px-4 py-2.5 text-left text-amber-100 hover:bg-amber-600/20 hover:text-amber-200 transition-colors">
                        Move object
                      </button>
                      <button onClick={() => toast.info("Hide/unhide create/edit window not implemented (static)")} className="w-full px-4 py-2.5 text-left text-amber-100 hover:bg-amber-600/20 hover:text-amber-200 transition-colors">
                        Hide/Unhide panel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Display Menu */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((s) => (s === "display" ? null : "display"))}
                  className={`px-3 py-1 rounded-md ${menuOpen === "display" ? "bg-amber-700/20 border border-amber-500" : "bg-black/40 border border-amber-800/20"}`}
                >
                  Display
                </button>
                {menuOpen === "display" && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-black/95 border border-amber-600 rounded-lg shadow-2xl z-50 overflow-hidden">
                    <div className="py-1">
                      <button className="w-full px-4 py-2.5 text-left text-amber-100 hover:bg-amber-600/20 hover:text-amber-200 transition-colors">
                        Brightness
                      </button>
                      <button className="w-full px-4 py-2.5 text-left text-amber-100 hover:bg-amber-600/20 hover:text-amber-200 transition-colors">
                        Contrast
                      </button>
                      <button className="w-full px-4 py-2.5 text-left text-amber-100 hover:bg-amber-600/20 hover:text-amber-200 transition-colors">
                        Gamma
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Help Menu */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((s) => (s === "help" ? null : "help"))}
                  className={`px-3 py-1 rounded-md ${menuOpen === "help" ? "bg-amber-700/20 border border-amber-500" : "bg-black/40 border border-amber-800/20"}`}
                >
                  Help
                </button>
                {menuOpen === "help" && (
                  <div className="absolute top-full left-0 mt-2 w-52 bg-black/95 border border-amber-600 rounded-lg shadow-2xl z-50 overflow-hidden">
                    <div className="py-1">
                      <button className="w-full px-4 py-2.5 text-left text-amber-100 hover:bg-amber-600/20 hover:text-amber-200 transition-colors">
                        Guideline
                      </button>
                      <button className="w-full px-4 py-2.5 text-left text-amber-100 hover:bg-amber-600/20 hover:text-amber-200 transition-colors">
                        Shortcut menu
                      </button>
                      <button className="w-full px-4 py-2.5 text-left text-amber-100 hover:bg-amber-600/20 hover:text-amber-200 transition-colors">
                        Log file
                      </button>
                      <button className="w-full px-4 py-2.5 text-left text-amber-100 hover:bg-amber-600/20 hover:text-amber-200 transition-colors">
                        Provide feedback
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </nav>
          </div>

          <div className="text-sm text-amber-300/80">Project: <span className="font-semibold">{project_id}</span></div>
        </div>
      </div>
    

      {/* ===== Main Area ===== */}
      <div className="max-w-[1400px] mx-auto flex gap-6">
        {/* Canvas Column */}
        <div className="flex flex-col items-start grow-[1]">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => navigate(-1)} className="bg-amber-900/20 border border-amber-600 text-amber-200 px-3 py-2 rounded hover:scale-105 transition">← Back</button>
            <h2 className="text-2xl font-semibold text-amber-200">Annotating Project #{project_id}</h2>
          </div>

          <div className="rounded-xl shadow-2xl border border-amber-500 overflow-hidden transition-transform duration-300 hover:scale-[1.005]">
            <DrawRect
              width={920}
              height={660}
              imageUrl={imageUrl}
              rectData={rectData}
              onChange={handleRectChange}
              drawEnabled={drawEnabled}
            />
          </div>

          {/* Annotation details table */}
          <div className="mt-6 w-full">
            <h3 className="text-lg font-semibold text-amber-100 mb-3">Annotation Details</h3>

            {rectData.length === 0 ? (
              <p className="text-amber-300/60 text-sm">No boxes drawn yet. Draw a box to begin.</p>
            ) : (
              <div className="overflow-hidden rounded-xl border border-amber-600 shadow-inner bg-black/40">
                <table className="min-w-full text-sm text-left">
                  <thead className="bg-amber-900/20 text-amber-100 font-semibold">
                    <tr>
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">X</th>
                      <th className="px-4 py-3">Y</th>
                      <th className="px-4 py-3">Width</th>
                      <th className="px-4 py-3">Height</th>
                      <th className="px-4 py-3">Class</th>
                      <th className="px-4 py-3">Attribute Name</th>
                      <th className="px-4 py-3">Attribute Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-700/30">
                    {rectData.map((box, index) => (
                      <tr key={box.id} className={`${index % 2 === 0 ? "bg-black/30" : "bg-black/20"} hover:bg-amber-900/30 transition`}>
                        <td className="px-4 py-3 font-medium text-amber-100">{index + 1}</td>
                        <td className="px-4 py-3 text-amber-200">{Number(box.x).toFixed(1)}</td>
                        <td className="px-4 py-3 text-amber-200">{Number(box.y).toFixed(1)}</td>
                        <td className="px-4 py-3 text-amber-200">{Number(box.width).toFixed(1)}</td>
                        <td className="px-4 py-3 text-amber-200">{Number(box.height).toFixed(1)}</td>
                        <td className="px-4 py-3 font-semibold text-amber-400">{box.classes?.className || "-"}</td>
                        <td className="px-4 py-3 text-amber-300">{box.classes?.attributeName || "-"}</td>
                        <td className="px-4 py-3 text-amber-300">{box.classes?.attributeValue || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Annotate Panel (right) */}
        <aside className="w-[320px] max-h-[75vh] overflow-auto p-4 rounded-xl border border-amber-500 bg-gradient-to-b from-black/80 to-neutral-900 shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-amber-100">ANNOTATE</h3>
            <div className="text-sm text-amber-300/60">Create • Edit</div>
          </div>

          {/* Tabs clickable */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setAnnotateTab("create")}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-shadow duration-200 ${annotateTab === "create" ? "bg-amber-500/20 border border-amber-400 text-amber-100 shadow-md" : "bg-black/60 border border-amber-600/20 text-amber-300"}`}
            >
              Create
            </button>
            <button
              onClick={() => setAnnotateTab("edit")}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-shadow duration-200 ${annotateTab === "edit" ? "bg-amber-500/20 border border-amber-400 text-amber-100 shadow-md" : "bg-black/60 border border-amber-600/20 text-amber-300"}`}
            >
              Edit
            </button>
          </div>

          {/* Create Tab */}
          {annotateTab === "create" && (
            <div className="space-y-3 pb-4">
              <div className="text-sm text-amber-300/70">CLASSES: <span className="font-semibold text-amber-200">{classes.length}</span></div>
              <div className="grid gap-2">
                {classes.map((c, idx) => (
                  <div key={c.name} className="flex items-center justify-between p-2 rounded-md border border-amber-700/30 bg-black/40 hover:border-amber-500 transition-all">
                    <div className="flex items-center gap-3">
                      <div style={{ width: 12, height: 12, borderRadius: 6, background: c.color || "#a67c00" }} />
                      <div className="text-sm font-medium text-amber-100">{c.name}</div>
                    </div>
                    <div className="text-xs text-amber-300/70">{idx + 1}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Edit Tab */}
          {annotateTab === "edit" && (
            <div className="space-y-3 pb-4">
              <div className="text-sm text-amber-300/70">Selected per box</div>
              {rectData.length === 0 ? (
                <div className="text-amber-300/60 text-sm">No boxes yet.</div>
              ) : (
                <div className="space-y-2">
                  {rectData.map((r, idx) => (
                    <div key={r.id} className="flex items-center justify-between p-2 rounded-md border border-amber-700/30 bg-black/40 transition-all hover:scale-[1.01]">
                      <div>
                        <div className="text-sm font-medium text-amber-100">{idx + 1}. {r.classes?.className || "—"}</div>
                        <div className="text-xs text-amber-300/70">{r.classes?.attributeName ? `${r.classes.attributeName}: ${r.classes.attributeValue || "-"}` : "No attribute"}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => onEditPencilClick(r.id)} title="Edit box" className="p-1 text-amber-200/90 hover:text-amber-100">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDeleteBox(r.id)} title="Delete box" className="p-1 text-amber-200/90 hover:text-amber-100">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bottom actions in panel */}
          <div className="mt-4 pt-3 border-t border-amber-700/20 sticky bottom-0 bg-gradient-to-b from-transparent to-black/60">
            <div className="flex gap-2">
              <button onClick={handleSaveAnnotation} disabled={isSaving} className="flex-1 px-4 py-2 rounded-md bg-amber-600 text-black font-semibold hover:shadow-lg transition transform active:scale-95 disabled:opacity-50">
                {isSaving ? "Saving..." : "Save and update"}
              </button>
              <button onClick={handleSubmitAnnotation} className={`flex-1 px-4 py-2 rounded-md font-semibold ${rectData.length === 0 ? "bg-amber-300 text-black/60 cursor-not-allowed" : "bg-black border border-amber-500 text-amber-200 hover:bg-amber-500/10"}`}>
                Submit Annotation
              </button>
            </div>
            <div className="mt-2 text-xs text-amber-300/60">Tip: After drawing a box you will be prompted to choose class & attribute.</div>
          </div>
        </aside>
      </div>

      {/* Modal for assign class + task info modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={closeModal} />
          <div className="relative bg-gradient-to-b from-neutral-900 to-black rounded-lg shadow-2xl w-[420px] p-6 z-10 border border-amber-600/40">
            <h4 className="text-lg font-semibold text-amber-100 mb-3">Assign Class & Attribute</h4>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1 text-amber-200">Class</label>
              <select value={modalClass} onChange={(e) => { setModalClass(e.target.value); setModalAttributeName(""); setModalAttributeValue(""); }} className="w-full bg-black/60 border border-amber-600 rounded px-3 py-2 text-amber-100">
                <option value="">Select class</option>
                {classes.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            {modalClass && (
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1 text-amber-200">Attribute Name</label>
                <select value={modalAttributeName} onChange={(e) => setModalAttributeName(e.target.value)} className="w-full bg-black/60 border border-amber-600 rounded px-3 py-2 text-amber-100">
                  <option value="">Select attribute</option>
                  {getAttributesForClass(classes, modalClass).map((a) => <option key={a.attrName} value={a.attrName}>{a.attrName}</option>)}
                </select>
              </div>
            )}

            {modalAttributeName && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-amber-200">Attribute Value</label>
                <select value={modalAttributeValue} onChange={(e) => setModalAttributeValue(e.target.value)} className="w-full bg-black/60 border border-amber-600 rounded px-3 py-2 text-amber-100">
                  <option value="">Select value</option>
                  {(() => {
                    const attr = getAttributesForClass(classes, modalClass).find((a) => a.attrName === modalAttributeName);
                    if (!attr) return null;
                    return attr.allowedValues.map((v) => <option key={v} value={v}>{v}</option>);
                  })()}
                </select>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button onClick={closeModal} className="px-4 py-2 rounded-md border border-amber-600 text-amber-200">Cancel</button>
              <button onClick={saveModalSelection} className="px-4 py-2 rounded-md bg-amber-500 text-black font-semibold">Save and update</button>
            </div>
          </div>
        </div>
      )}

      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowTaskModal(false)} />
          <div className="relative bg-black rounded-lg p-6 z-10 border border-amber-600 w-[420px]">
            <h4 className="text-lg font-semibold text-amber-100 mb-2">Task information</h4>
            <div className="text-amber-200 mb-2"><strong>Project ID:</strong> {project_id}</div>
            <div className="text-amber-200 mb-4"><strong>Project name:</strong> (static name or fetch from API)</div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowTaskModal(false)} className="px-3 py-2 rounded-md border border-amber-600 text-amber-200">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Note
- This component expects DrawRect to accept prop: drawEnabled (boolean).
- Deleting a box updates rectData state; DrawRect reads rectData prop so canvas updates, and the table/edit lists update from rectData too.
*/
