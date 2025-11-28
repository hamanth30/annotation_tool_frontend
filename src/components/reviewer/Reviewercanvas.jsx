import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import DrawRect from "../employee/DrawRect";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Pencil,
  Trash2,
  Copy,
  MousePointer2,
  Square,
  Hexagon,
  Palette,
} from "lucide-react";

const API_BASE_URL = "http://localhost:8000";

// Utility to get attributes for a class
const getAttributesForClass = (classes, className) => {
  const cls = classes.find((c) => c.name === className);
  if (!cls) return [];
  return Object.entries(cls.attributes || {}).map(([attrName, attrDef]) => ({
    attrName,
    allowedValues:
      (attrDef && attrDef.allowed_values) || (Array.isArray(attrDef) ? attrDef : []),
  }));
};

export default function ReviewFile() {
  const { projectId, fileId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectText, setRejectText] = useState("");


  const token = localStorage.getItem("token");
  const user_id = localStorage.getItem("userId");

  // Get image URL from navigation state
  const imageUrlFromState = location.state?.imageUrl || "";

  const [imageUrl, setImageUrl] = useState("");
  const [rectData, setRectData] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // Annotate panel + modal state
  const [annotateTab, setAnnotateTab] = useState("create");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalBoxId, setModalBoxId] = useState(null);
  const [modalClass, setModalClass] = useState("");
  const [modalAttributeName, setModalAttributeName] = useState("");
  const [modalAttributeValue, setModalAttributeValue] = useState("");

  // Menu bar state
  const [menuOpen, setMenuOpen] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);

  // Edit options state
  const [drawEnabled, setDrawEnabled] = useState(true);

  // Toolbar state (added from Code 1)
  const [toolMode, setToolMode] = useState("rectangle"); // cursor | rectangle | polygon
  const [boxColor, setBoxColor] = useState("#d4a800");
  const [panelVisible, setPanelVisible] = useState(true);

  // Track previous rect count to detect new rects
  const prevCountRef = useRef(0);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside (from Code 1)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(null);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  // Load image URL from navigation state (Code 3 base)
  useEffect(() => {
    setLoading(true);
    setError("");

    if (!imageUrlFromState) {
      setError("No image URL provided. Please navigate from the file list.");
      setLoading(false);
      return;
    }
    if (!projectId || !fileId) {
      setError("Missing project or file ID.");
      setLoading(false);
      return;
    }
    setImageUrl(imageUrlFromState);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, fileId, imageUrlFromState]);

  // Fetch project classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/employee/projects/${projectId}/classes`,
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
    if (projectId) fetchClasses();
  }, [projectId, token]);

  // Handle rect changes from DrawRect
  const handleRectChange = (rects) => {
    const normalized = rects.map((r) => ({
      ...r,
      classes: r.classes || { className: "", attributeName: "", attributeValue: "" },
      color: r.color || boxColor,
    }));

    const prevCount = prevCountRef.current || 0;
    if (normalized.length > prevCount) {
      const existingIds = new Set((rectData || []).map((r) => r.id));
      const added = normalized.find((r) => !existingIds.has(r.id));
      if (added) {
        // propagate new rects, then open modal for the new id
        setRectData(normalized);
        prevCountRef.current = normalized.length;
        // open modal for the newly added rect (same behavior as Code 1)
        // slight delay ensures rectData state is set — but we can open immediately using added.id
        openModalForBox(added.id);
        return;
      }
    }

    prevCountRef.current = normalized.length;
    setRectData(normalized);
  };

  // Modal helpers
  const openModalForBox = (boxId) => {
    const box = rectData.find((r) => String(r.id) === String(boxId));
    if (!box) {
      // If the box isn't present yet in rectData, open empty modal and set id
      setModalBoxId(boxId);
      setModalClass("");
      setModalAttributeName("");
      setModalAttributeValue("");
      setModalOpen(true);
      setAnnotateTab("edit");
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
              color: r.color || boxColor,
            }
          : r
      )
    );
    closeModal();
  };

  // Delete box
  const handleDeleteBox = (boxId) => {
    setRectData((prev) => {
      const updated = prev.filter((r) => String(r.id) !== String(boxId));
      prevCountRef.current = updated.length;
      return updated;
    });
    toast.info("Box removed.");
  };

  // Edit tab helpers
  const onEditPencilClick = (boxId) => {
    openModalForBox(boxId);
  };

  // Menu actions
  const openFileUrlInNewTab = () => {
    if (!imageUrl) {
      toast.error("No file URL available.");
      return;
    }
    window.open(imageUrl, "_blank");
  };

  const openTaskInfo = () => {
    setShowTaskModal(true);
    setMenuOpen(null);
  };

  const closeTaskInfo = () => setShowTaskModal(false);

  // Copy to clipboard helper
  const copyToClipboard = (text, label) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success(`${label} copied to clipboard!`);
      })
      .catch(() => {
        toast.error("Failed to copy");
      });
  };

  const getFileName = () => {
    if (!imageUrl) return "N/A";
    try {
      const urlParts = imageUrl.split("/");
      return urlParts[urlParts.length - 1] || "N/A";
    } catch {
      return "N/A";
    }
  };

  // Save annotation
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

      console.log(payload)
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

  // Submit annotation
  const handleSubmitAnnotation = async () => {
    if (rectData.length === 0) {
      toast.warning("Draw at least one box before submitting.");
      return;
    }

    if (!window.confirm("Submit annotation for review?")) return;

    try {
      const payload = {
        project_id: projectId,
        file_id: fileId,
        user_id: user_id,
      };
      console.log("submit payloaaaaaaaaaaaaad",payload)

      await axios.post(`${API_BASE_URL}/api/employee/submit`, payload, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });

      toast.success("Submitted successfully!");
      setTimeout(() => navigate(-1), 700);
    } catch (err) {
      console.error("Submit failed:", err);
      toast.error("Submit failed. Check console.");
    }
  };

  // dynamic canvas width per Option 1
  const canvasWidth = panelVisible ? 920 : 1240;

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500 text-lg">
        Loading…
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="text-center text-red-500 mt-10 font-medium">{error}</div>
    );
  }

  // Render no image state
  if (!imageUrl) {
    return (
      <div className="text-center text-red-500 mt-10 font-medium">No image to display.</div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-black via-neutral-900 to-gray-900 text-amber-100">
      {/* ===== Left Toolbar (from Code 1) ===== */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50">
        <div className="bg-black/95 border border-amber-600 rounded-lg shadow-2xl p-2 flex flex-col gap-2">
          {/* Cursor Tool */}
          <button
            onClick={() => {
              setToolMode("cursor");
              setDrawEnabled(false);
            }}
            className={`p-3 rounded-md transition-all duration-200 ${
              toolMode === "cursor"
                ? "bg-amber-600 text-black shadow-lg"
                : "bg-black/60 border border-amber-600/20 text-amber-300 hover:bg-amber-800/30"
            }`}
            title="Cursor (Select/Move)"
          >
            <MousePointer2 size={20} />
          </button>

          {/* Rectangle Tool */}
          <button
            onClick={() => {
              setToolMode("rectangle");
              setDrawEnabled(true);
            }}
            className={`p-3 rounded-md transition-all duration-200 ${
              toolMode === "rectangle"
                ? "bg-amber-600 text-black shadow-lg"
                : "bg-black/60 border border-amber-600/20 text-amber-300 hover:bg-amber-800/30"
            }`}
            title="Rectangle (Draw bounding boxes)"
          >
            <Square size={20} />
          </button>

          {/* Polygon Tool (non-functional per Option A) */}
          <button
            onClick={() => {
              setToolMode("polygon");
              setDrawEnabled(false);
              toast.info("Polygon mode selected (polygon drawing not implemented).");
            }}
            className={`p-3 rounded-md transition-all duration-200 ${
              toolMode === "polygon"
                ? "bg-amber-600 text-black shadow-lg"
                : "bg-black/60 border border-amber-600/20 text-amber-300 hover:bg-amber-800/30"
            }`}
            title="Polygon (Not implemented)"
          >
            <Hexagon size={20} />
          </button>

          {/* Color Picker */}
          <div className="relative group">
            <input
              type="color"
              value={boxColor}
              onChange={(e) => setBoxColor(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              title="Choose box color"
            />
            <div className={`p-3 rounded-md transition-all duration-200 bg-black/60 border border-amber-600/20 hover:bg-amber-800/30 flex items-center justify-center relative`}>
              <Palette size={20} className="text-amber-300" />
              <div
                className="absolute bottom-1 left-1 right-1 h-1 rounded"
                style={{ backgroundColor: boxColor }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ===== Top Menu Bar ===== */}
      <div className="max-w-[1400px] mx-auto mb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="text-xl font-bold text-amber-300">REVIEW</div>
            <nav ref={menuRef} className="flex gap-2">
              {/* General Menu */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((s) => (s === "general" ? null : "general"))}
                  className={`px-3 py-1 rounded-md ${
                    menuOpen === "general" ? "bg-amber-700/20 border border-amber-500" : "bg-black/40 border border-amber-800/20"
                  }`}
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
                      <button onClick={() => copyToClipboard(getFileName(), "File name")} className="w-full px-4 py-2.5 text-left text-amber-100 hover:bg-amber-600/20 hover:text-amber-200 transition-colors">
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
                  className={`px-3 py-1 rounded-md ${
                    menuOpen === "edit" ? "bg-amber-700/20 border border-amber-500" : "bg-black/40 border border-amber-800/20"
                  }`}
                >
                  Edit
                </button>
                {menuOpen === "edit" && (
                  <div className="absolute top-full left-0 mt-2 w-72 bg-black/95 border border-amber-600 rounded-lg shadow-2xl z-50 overflow-hidden">
                    <div className="py-2">
                      <div className="px-4 py-3 bg-gradient-to-r from-amber-900/10 to-transparent">
                        <div className="text-xs font-semibold text-amber-300/80 mb-3 uppercase tracking-wide">
                          Drawing Mode
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setDrawEnabled(true); setToolMode("rectangle"); }}
                            className={`flex-1 px-4 py-2.5 rounded-md text-xs font-bold transition-all duration-300 ease-out ${
                              drawEnabled ? "bg-amber-600 text-black shadow-lg scale-105 ring-2 ring-amber-400/50" : "bg-amber-900/40 text-amber-300 hover:bg-amber-800/50"
                            }`}
                          >
                            DRAW
                          </button>
                          <button
                            onClick={() => { setDrawEnabled(false); setToolMode("cursor"); }}
                            className={`flex-1 px-4 py-2.5 rounded-md text-xs font-bold transition-all duration-300 ease-out ${
                              !drawEnabled ? "bg-amber-600 text-black shadow-lg scale-105 ring-2 ring-amber-400/50" : "bg-amber-900/40 text-amber-300 hover:bg-amber-800/50"
                            }`}
                          >
                            SELECT
                          </button>
                        </div>

                        <div className="mt-3 flex items-center gap-2 text-xs">
                          <div className={`w-2 h-2 rounded-full animate-pulse ${drawEnabled ? "bg-amber-500" : "bg-blue-500"}`}></div>
                          <span className="text-amber-300/70">
                            {drawEnabled ? "Click and drag to draw boxes" : "Click boxes to select and resize"}
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-amber-700/30 my-2"></div>

                      <button
                        onClick={() => { toast.info("Move object: drag box to move (already enabled)"); setMenuOpen(null); }}
                        className="w-full px-4 py-2.5 text-left text-amber-100 hover:bg-amber-600/20 hover:text-amber-200 transition-colors"
                      >
                        Move object
                      </button>

                      <button
                        onClick={() => { setPanelVisible((v) => !v); setMenuOpen(null); }}
                        className="w-full px-4 py-2.5 text-left text-amber-100 hover:bg-amber-600/20 hover:text-amber-200 transition-colors"
                      >
                        {panelVisible ? "Hide panel" : "Show panel"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Display Menu */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((s) => (s === "display" ? null : "display"))}
                  className={`px-3 py-1 rounded-md ${
                    menuOpen === "display" ? "bg-amber-700/20 border border-amber-500" : "bg-black/40 border border-amber-800/20"
                  }`}
                >
                  Display
                </button>
                {menuOpen === "display" && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-black/95 border border-amber-600 rounded-lg shadow-2xl z-50 overflow-hidden">
                    <div className="py-1">
                      <button className="w-full px-4 py-2.5 text-left text-amber-100 hover:bg-amber-600/20 transition-colors">Brightness</button>
                      <button className="w-full px-4 py-2.5 text-left text-amber-100 hover:bg-amber-600/20 transition-colors">Contrast</button>
                      <button className="w-full px-4 py-2.5 text-left text-amber-100 hover:bg-amber-600/20 transition-colors">Gamma</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Help Menu */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((s) => (s === "help" ? null : "help"))}
                  className={`px-3 py-1 rounded-md ${
                    menuOpen === "help" ? "bg-amber-700/20 border border-amber-500" : "bg-black/40 border border-amber-800/20"
                  }`}
                >
                  Help
                </button>
                {menuOpen === "help" && (
                  <div className="absolute top-full left-0 mt-2 w-52 bg-black/95 border border-amber-600 rounded-lg shadow-2xl z-50 overflow-hidden">
                    <div className="py-1">
                      <button className="w-full px-4 py-2.5 text-left text-amber-100 hover:bg-amber-600/20 transition-colors">Guideline</button>
                      <button className="w-full px-4 py-2.5 text-left text-amber-100 hover:bg-amber-600/20 transition-colors">Shortcut menu</button>
                      <button className="w-full px-4 py-2.5 text-left text-amber-100 hover:bg-amber-600/20 transition-colors">Log file</button>
                      <button className="w-full px-4 py-2.5 text-left text-amber-100 hover:bg-amber-600/20 transition-colors">Provide feedback</button>
                    </div>
                  </div>
                )}
              </div>
            </nav>
          </div>

          <div className="text-sm text-amber-300/80">
            Project: <span className="font-semibold">{projectId}</span> | File: <span className="font-semibold">{fileId}</span>
          </div>
        </div>
      </div>

      {/* ===== Main Area ===== */}
      <div className="max-w-[1400px] mx-auto flex gap-6">
        {/* Canvas Column */}
        <div className="flex flex-col items-start grow-[1]">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => navigate(-1)} className="bg-amber-900/20 border border-amber-600 text-amber-200 px-3 py-2 rounded hover:scale-105 transition">← Back</button>
            <h2 className="text-2xl font-semibold text-amber-200">Annotating Project #{projectId}</h2>
          </div>

          <div className="rounded-xl shadow-2xl border border-amber-500 overflow-hidden transition-transform duration-300 hover:scale-[1.005]">
            <DrawRect
              width={canvasWidth}
              height={660}
              imageUrl={imageUrl}
              rectData={rectData}
              onChange={handleRectChange}
              drawEnabled={drawEnabled}
              mode={toolMode}
              boxColor={boxColor}
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
        <aside className={`transition-all duration-300 ${panelVisible ? "w-[320px] max-h-[75vh] overflow-auto p-4" : "w-0 p-0 pointer-events-none opacity-0"} rounded-xl border border-amber-500 bg-gradient-to-b from-black/80 to-neutral-900 shadow-lg`}>
          {panelVisible && (
            <div className="w-[320px] max-h-[75vh] overflow-auto p-4 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-amber-100">REVIEW</h3>
                <div className="text-sm text-amber-300/60">Create • Edit</div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-4">
                <button onClick={() => setAnnotateTab("create")} className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-shadow duration-200 ${annotateTab === "create" ? "bg-amber-500/20 border border-amber-400 text-amber-100 shadow-md" : "bg-black/60 border border-amber-600/20 text-amber-300"}`}>Create</button>
                <button onClick={() => setAnnotateTab("edit")} className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-shadow duration-200 ${annotateTab === "edit" ? "bg-amber-500/20 border border-amber-400 text-amber-100 shadow-md" : "bg-black/60 border border-amber-600/20 text-amber-300"}`}>Edit</button>
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
                            <button onClick={() => onEditPencilClick(r.id)} title="Edit box" className="p-1 text-amber-200/90 hover:text-amber-100"><Pencil size={16} /></button>
                            <button onClick={() => handleDeleteBox(r.id)} title="Delete box" className="p-1 text-amber-200/90 hover:text-amber-100"><Trash2 size={16} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Bottom actions in panel */}
              <div className="mt-4 pt-3 border-t border-amber-700/20 sticky bottom-0 bg-gradient-to-b from-transparent to-black/60">
                {/* <div className="flex gap-2">
                  <button onClick={handleSaveAnnotation} disabled={isSaving} className="flex-1 px-4 py-2 rounded-md bg-amber-600 text-black font-semibold hover:shadow-lg transition transform active:scale-95 disabled:opacity-50">
                    {isSaving ? "Saving..." : "Save"}
                  </button>
                  <button onClick={handleSubmitAnnotation} disabled={rectData.length === 0} className={`flex-1 px-4 py-2 rounded-md font-semibold transition ${rectData.length === 0 ? "bg-amber-300 text-black/60 cursor-not-allowed" : "bg-black border border-amber-500 text-amber-200 hover:bg-amber-500/10"}`}>
                    Submit
                  </button>
                </div> */}

                                {/* Bottom actions in panel */}
                <div className="mt-4 pt-3 border-t border-amber-700/20 sticky bottom-0 bg-gradient-to-b from-transparent to-black/60">

                    {/* SAVE (top full-width) */}
                    <button
                    className="w-full mb-3 px-4 py-2 rounded-md bg-amber-600 text-black font-semibold hover:shadow-lg transition active:scale-95"
                    >
                    Save
                    </button>

                    {/* APPROVE + REJECT (same row) */}
                    <div className="flex gap-2 w-full">

                    <button
                        onClick={async () => {
                            const config = {

                                    params: {
                                        file_id: fileId 
                                    }

                            };
                            const url=`${API_BASE_URL}/api/reviewer/accept-annotation`
                            //const response = await axios.put(url, null, config)
                            try {
                                const response = await axios.put(url, null, config);
                                
                                console.log("Annotation accepted successfully.");
                                console.log("Response data:", response.data);
                                navigate(`/reviewer/randomfiles/${projectId}/${localStorage.getItem("userId")}`)
                                return response.data;
                                
                            } 
                            catch (error) {
                                console.error("Error accepting annotation:", error.response ? error.response.data : error.message);
                                throw error;
                            }
                        }}
                        className="flex-1 px-4 py-2 rounded-md bg-green-600 text-black font-semibold hover:shadow-lg transition active:scale-95"
                    >
                        Approve
                    </button>

                    <button
                        onClick={() => setRejectOpen(!rejectOpen)}
                        className="flex-1 px-4 py-2 rounded-md bg-red-600 text-black font-semibold hover:shadow-lg transition active:scale-95"
                    >
                    Reject
                    </button>


                    </div>

                    <div className="mt-2 text-xs text-amber-300/60">
                    Tip: After drawing a box you will be prompted to choose class & attribute.
                    </div>
                </div>


                
              </div>
            </div>
          )}



          {rejectOpen && (
            <div className="mt-3 p-3 bg-black/70 border border-red-600 rounded-lg shadow-lg">
                
                <div className="text-red-400 font-semibold text-sm mb-2">
                Reason for rejection
                </div>

                <textarea
                value={rejectText}
                onChange={(e) => setRejectText(e.target.value)}
                className="w-full bg-black/40 border border-red-500 text-red-200 rounded p-2 text-sm"
                rows={3}
                placeholder="Explain why this file is being rejected..."
                />

                <div className="flex justify-end gap-2 mt-2">
                <button
                    onClick={() => setRejectOpen(false)}
                    className="px-3 py-1 text-xs rounded-md border border-red-600 text-red-300"
                >
                    Cancel
                </button>

                <button
                    onClick={() => {
                    // YOU WILL HANDLE THIS SAVE API CALL
                    console.log("Rejecting with reason:", rejectText);
                    // After sending to backend:
                    // axios.post(...) etc.
                    setRejectOpen(false);
                    setRejectText("");
                    axios.put("http://localhost:8000/api/reviewer/reject", {
                        project_id: projectId,
                        file_id: fileId,
                        reviewer_id: localStorage.getItem("userId"),
                        rejection_description: rejectText
                    }, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    })
                    .then(res => {
                        console.log("Rejected:", res.data);
                        toast.success("File rejected");
                    })
                    .catch(err => {
                        console.error("Reject failed:", err);
                        toast.error("Reject failed");
                    });
                    navigate(`/reviewer/randomfiles/${projectId}/${localStorage.getItem("userId")}`)

                    }}
                    className="px-3 py-1 text-xs rounded-md bg-red-600 text-black font-semibold"
                >
                    OK
                </button>
                </div>

            </div>
            )}

        </aside>
      </div>

      {/* Modal for assign class */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={closeModal} />
          <div className="relative bg-gradient-to-b from-neutral-900 to-black rounded-lg shadow-2xl w-[420px] p-6 z-10 border border-amber-600/40">
            <h4 className="text-sm font-semibold text-amber-100 mb-3">Assign Class & Attribute</h4>

            <div className="mb-3">
              <label className="block text-xs font-medium mb-1 text-amber-200">Class</label>
              <select value={modalClass} onChange={(e) => { setModalClass(e.target.value); setModalAttributeName(""); setModalAttributeValue(""); }} className="w-full bg-black/60 border border-amber-600 rounded px-3 py-2 text-amber-100 text-xs">
                <option value="">Select class</option>
                {classes.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            {modalClass && (
              <div className="mb-3">
                <label className="block text-xs font-medium mb-1 text-amber-200">Attribute Name</label>
                <select value={modalAttributeName} onChange={(e) => setModalAttributeName(e.target.value)} className="w-full bg-black/60 border border-amber-600 rounded px-3 py-2 text-amber-100 text-xs">
                  <option value="">Select attribute</option>
                  {getAttributesForClass(classes, modalClass).map((a) => <option key={a.attrName} value={a.attrName}>{a.attrName}</option>)}
                </select>
              </div>
            )}

            {modalAttributeName && (
              <div className="mb-4">
                <label className="block text-xs font-medium mb-1 text-amber-200">Attribute Value</label>
                <select value={modalAttributeValue} onChange={(e) => setModalAttributeValue(e.target.value)} className="w-full bg-black/60 border border-amber-600 rounded px-3 py-2 text-amber-100 text-xs">
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
              <button onClick={closeModal} className="px-4 py-2 rounded-md border border-amber-600 text-amber-200 text-xs">Cancel</button>
              <button onClick={saveModalSelection} className="px-4 py-2 rounded-md bg-amber-500 text-black font-semibold text-xs">Save and update</button>
            </div>
          </div>
        </div>
      )}

      {/* Task info modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowTaskModal(false)} />
          <div className="relative bg-black rounded-lg p-6 z-10 border border-amber-600 w-[420px]">
            <h4 className="text-sm font-semibold text-amber-100 mb-4">Task information</h4>

            <div className="text-xs text-amber-200 mb-3 flex items-center justify-between group">
              <div>
                <strong className="text-amber-300">Project ID:</strong> {projectId}
              </div>
              <button onClick={() => copyToClipboard(projectId, "Project ID")} className="p-1.5 hover:bg-amber-600/20 rounded transition-colors opacity-0 group-hover:opacity-100" title="Copy Project ID">
                <Copy size={14} className="text-amber-300" />
              </button>
            </div>

            <div className="text-xs text-amber-200 mb-3 flex items-center justify-between group">
              <div>
                <strong className="text-amber-300">File name:</strong> {getFileName()}
              </div>
              <button onClick={() => copyToClipboard(getFileName(), "File name")} className="p-1.5 hover:bg-amber-600/20 rounded transition-colors opacity-0 group-hover:opacity-100" title="Copy File name">
                <Copy size={14} className="text-amber-300" />
              </button>
            </div>

            <div className="text-xs text-amber-200 mb-4">
              <strong className="text-amber-300">Project name:</strong> (static name or fetch from API)
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowTaskModal(false)} className="px-3 py-2 rounded-md border border-amber-600 text-amber-200 text-xs">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
