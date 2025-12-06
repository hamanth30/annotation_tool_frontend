import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import DrawRect from "./DrawRect";
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
  Minus,
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

export default function AnnotateFile() {
  const { projectId, fileId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

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
  const [projectName, setProjectName] = useState("");

  // Annotate panel + modal state
  const [annotateTab, setAnnotateTab] = useState("create");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalBoxId, setModalBoxId] = useState(null);
  const [modalClass, setModalClass] = useState("");
  const [modalAttributeName, setModalAttributeName] = useState("");
  const [modalAttributeValue, setModalAttributeValue] = useState("");
  const [activeShapeType, setActiveShapeType] = useState(null);



  // Menu bar state
  const [menuOpen, setMenuOpen] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showAnnotationDataModal, setShowAnnotationDataModal] = useState(false);
  const [viewingPointsFor, setViewingPointsFor] = useState(null);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  // Edit options state
  const [drawEnabled, setDrawEnabled] = useState(true);

  // Toolbar state (added from Code 1)
  const [toolMode, setToolMode] = useState("rectangle"); // cursor | rectangle | polygon
  const [boxColor, setBoxColor] = useState("#d4a800");
  const [panelVisible, setPanelVisible] = useState(true);
  const [brightness, setBrightness] = useState(0); // Brightness value: -1 to 1

  // Track previous rect count to detect new rects
  const prevCountRef = useRef(0);
  const menuRef = useRef(null);

  const [rejectionComments, setRejectionComments] = useState([]);
const [loadingRejections, setLoadingRejections] = useState(false);

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

  // Fetch project name
  useEffect(() => {
    const fetchProjectName = async () => {
      if (!projectId) {
        setProjectName("");
        return;
      }
      try {
        // Try to fetch from user projects endpoint
        const userId = localStorage.getItem("userId");
        const res = await axios.get(
          `${API_BASE_URL}/api/employee/user_projects/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const projects = res.data || [];
        console.log("Employee: Fetched projects for name lookup:", projects);
        console.log("Employee: Looking for projectId:", projectId, "Type:", typeof projectId);
        console.log("Employee: Project IDs in array:", projects.map(p => ({ id: p.id, type: typeof p.id, name: p.name })));
        
        // Try multiple comparison methods to handle different ID types
        const project = projects.find((p) => {
          // Try direct comparison
          if (p.id === projectId) return true;
          // Try string comparison
          if (String(p.id) === String(projectId)) return true;
          // Try number comparison (in case one is number and other is string number)
          if (Number(p.id) === Number(projectId) && !isNaN(Number(p.id)) && !isNaN(Number(projectId))) return true;
          // Try project_id field if it exists
          if (p.project_id && (String(p.project_id) === String(projectId) || p.project_id === projectId)) return true;
          return false;
        });
        
        console.log("Employee: Found project:", project, "for projectId:", projectId);
        if (project && project.name) {
          setProjectName(project.name);
        } else {
          console.warn("Employee: Project not found or has no name. Available projects:", projects.map(p => ({ id: p.id, name: p.name })));
          setProjectName(""); // Set to empty string if not found
        }
      } catch (err) {
        console.error("Failed to load project name", err);
        setProjectName(""); // Set to empty string on error
      }
    };
    if (projectId && token) fetchProjectName();
  }, [projectId, token]);

  // Fetch existing annotations for this file
  useEffect(() => {
    const fetchAnnotations = async () => {
      if (!fileId) return;

      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/general/annotations/${fileId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("Employee: fetched annotations response", res.data);

        const annotations = res.data?.annotations || [];

        if (annotations.length === 0) {
          console.log("Employee: no annotations found for this file");
          return;
        }

        // Take the last annotation entry
        const latestAnnotation = annotations[annotations.length - 1];
        let annotationData = latestAnnotation?.data || [];

        // In case backend stores JSON as string, attempt to parse
        if (typeof annotationData === "string") {
          try {
            annotationData = JSON.parse(annotationData);
          } catch (e) {
            console.error(
              "Employee: failed to parse annotation data JSON string",
              e
            );
            annotationData = [];
          }
        }

        if (!Array.isArray(annotationData)) {
          console.warn(
            "Employee: annotation data is not an array, got:",
            annotationData
          );
          return;
        }

        // Convert annotation data to rectData format
        const convertedRects = annotationData.map((box) => {
          const baseShape = {
            id: String(box.id),
            type: box.type || "rectangle",
            classes: {
              className: box.classes?.className || "",
              attributeName: box.classes?.attributeName || "",
              attributeValue: box.classes?.attributeValue || "",
            },
            color: boxColor,
          };

          // Handle rectangles
          if (box.type === "rectangle" || !box.type) {
            return {
              ...baseShape,
              x: Number(box.x),
              y: Number(box.y),
              width: Number(box.width),
              height: Number(box.height),
            };
          }

          // Handle polygons and polylines
          if (box.type === "polygon" || box.type === "polyline") {
            return {
              ...baseShape,
              points: Array.isArray(box.points) ? box.points.map(Number) : [],
            };
          }

          return baseShape;
        });

        console.log("Employee: converted rects", convertedRects);

        setRectData(convertedRects);
        prevCountRef.current = convertedRects.length;

        if (convertedRects.length > 0) {
          toast.info(`Loaded ${convertedRects.length} existing annotation(s)`);
        }
      } catch (err) {
        // If no annotations found (404), that's okay - file might be new
        if (err.response?.status !== 404) {
          console.error("Employee: failed to load annotations", err);
        } else {
          console.log("Employee: no annotations (404) for this file yet");
        }
      }
    };

    if (fileId && imageUrl) {
      fetchAnnotations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileId, imageUrl, token]);

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
  // const openModalForBox = (boxId) => {
  //   const box = rectData.find((r) => String(r.id) === String(boxId));
  //   if (!box) {
  //     // If the box isn't present yet in rectData, open empty modal and set id
  //     setModalBoxId(boxId);
  //     setModalClass("");
  //     setModalAttributeName("");
  //     setModalAttributeValue("");
  //     setModalOpen(true);
  //     setAnnotateTab("edit");
  //     return;
  //   }
  //   setModalBoxId(boxId);
  //   setModalClass(box.classes?.className || "");
  //   setModalAttributeName(box.classes?.attributeName || "");
  //   setModalAttributeValue(box.classes?.attributeValue || "");
  //   setModalOpen(true);
  //   setAnnotateTab("edit");
  // };


  // Fetch rejection comments
const fetchRejectionComments = async () => {
  if (!fileId) return;
  
  setLoadingRejections(true);
  try {
    const res = await axios.get(
      `${API_BASE_URL}/api/employee/rejection/${fileId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    console.log("Fetched rejection comments:", res.data);
    console.log("timestamp:", res.data?.submitted_at);
    
    // Extract rejection_description array from response
    const comments = res.data?.rejection_description || [];
    setRejectionComments(comments);
    
    if (comments.length > 0) {
      toast.info(`Loaded ${comments.length} rejection comment(s)`);
    }
  } catch (err) {
    if (err.response?.status === 404) {
      console.log("No rejection comments found for this file");
      setRejectionComments([]);
    } else {
      console.error("Failed to load rejection comments:", err);
      toast.error("Failed to load rejection comments");
    }
  } finally {
    setLoadingRejections(false);
  }
};

// Fetch rejection comments when file loads
useEffect(() => {
  if (fileId && imageUrl) {
    fetchRejectionComments();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [fileId, imageUrl]);


  const openModalForBox = (boxId) => {
  const box = rectData.find((r) => String(r.id) === String(boxId));

  if (box?.type) {
    setActiveShapeType(box.type);
  } else {
    setActiveShapeType(toolMode);
  }

  setModalBoxId(boxId);
  setModalClass(box?.classes?.className || "");
  setModalAttributeName(box?.classes?.attributeName || "");
  setModalAttributeValue(box?.classes?.attributeValue || "");
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

  // Copy ID to clipboard
  const handleCopyId = async (id) => {
    try {
      await navigator.clipboard.writeText(id);
      toast.success(`ID copied: ${id}`);
    } catch (err) {
      console.error("Failed to copy ID:", err);
      toast.error("Failed to copy ID");
    }
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
      console.log("Employee: Saving rectData", rectData);
      const payload = {
        data: rectData.map((b) => {
          const baseData = {
            id: String(b.id),
            type: b.type || "rectangle",
            classes: {
              className: b.classes?.className || "",
              attributeName: b.classes?.attributeName || "",
              attributeValue: b.classes?.attributeValue || "",
            },
          };

          // Handle rectangles
          if (b.type === "rectangle" || !b.type) {
            return {
              ...baseData,
              x: Number(b.x),
              y: Number(b.y),
              width: Number(b.width),
              height: Number(b.height),
            };
          }

          // Handle polygons and polylines
          if (b.type === "polygon" || b.type === "polyline") {
            return {
              ...baseData,
              points: Array.isArray(b.points) ? b.points.map(Number) : [],
            };
          }

          return baseData;
        }),
      };

      console.log("Employee: Saving payload to backend", payload);
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
  const canvasWidth = panelVisible ? 860 : 1240;

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
        <div className="bg-black/95 border border-amber-600 rounded-lg shadow-2xl p-1.5 flex flex-col gap-1.5">
          {/* Cursor Tool */}
          <button
            onClick={() => {
              setToolMode("cursor");
              setDrawEnabled(false);
            }}
            className={`p-2 rounded-md transition-all duration-200 ${
              toolMode === "cursor"
                ? "bg-amber-600 text-black shadow-lg"
                : "bg-black/60 border border-amber-600/20 text-amber-300 hover:bg-amber-800/30"
            }`}
            title="Cursor (Select/Move)"
          >
            <MousePointer2 size={16} />
          </button>

          {/* Rectangle Tool */}
          <button
            onClick={() => {
              setToolMode("rectangle");
              setDrawEnabled(true);
            }}
            className={`p-2 rounded-md transition-all duration-200 ${
              toolMode === "rectangle"
                ? "bg-amber-600 text-black shadow-lg"
                : "bg-black/60 border border-amber-600/20 text-amber-300 hover:bg-amber-800/30"
            }`}
            title="Rectangle (Draw bounding boxes)"
          >
            <Square size={16} />
          </button>

          {/* Polyline Tool */}
          <button
            onClick={() => {
              setToolMode("polyline");
              setDrawEnabled(true);
            }}
            className={`p-2 rounded-md transition-all duration-200 ${
              toolMode === "polyline"
                ? "bg-amber-600 text-black shadow-lg"
                : "bg-black/60 border border-amber-600/20 text-amber-300 hover:bg-amber-800/30"
            }`}
            title="Polyline (Draw connected lines)"
          >
            <Minus size={16} />
          </button>

          {/* Polygon Tool */}
          <button
            onClick={() => {
              setToolMode("polygon");
              setDrawEnabled(true);
            }}
            className={`p-2 rounded-md transition-all duration-200 ${
              toolMode === "polygon"
                ? "bg-amber-600 text-black shadow-lg"
                : "bg-black/60 border border-amber-600/20 text-amber-300 hover:bg-amber-800/30"
            }`}
            title="Polygon (Draw closed shapes)"
          >
            <Hexagon size={16} />
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
            <div className={`p-2 rounded-md transition-all duration-200 bg-black/60 border border-amber-600/20 hover:bg-amber-800/30 flex items-center justify-center relative`}>
              <Palette size={16} className="text-amber-300" />
              <div
                className="absolute bottom-0.5 left-0.5 right-0.5 h-0.5 rounded"
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
            <div className="text-xl font-bold text-amber-300">ANNOTATE</div>
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

                      <button
                        onClick={() => { setShowAnnotationDataModal(true); setMenuOpen(null); }}
                        className="w-full px-4 py-2.5 text-left text-amber-100 hover:bg-amber-600/20 hover:text-amber-200 transition-colors"
                      >
                        View annotation data
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
                  <div className="absolute top-full left-0 mt-2 w-64 bg-black/95 border border-amber-600 rounded-lg shadow-2xl z-50 overflow-hidden">
                    <div className="py-3">
                      {/* Brightness Slider */}
                      <div className="px-4 py-2">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-amber-200">Brightness</label>
                          <span className="text-xs text-amber-300/70 font-mono">{brightness > 0 ? '+' : ''}{brightness.toFixed(2)}</span>
                        </div>
                        <input
                          type="range"
                          min="-1"
                          max="1"
                          step="0.01"
                          value={brightness}
                          onChange={(e) => setBrightness(parseFloat(e.target.value))}
                          className="w-full h-2 bg-amber-900/30 rounded-lg appearance-none cursor-pointer accent-amber-500"
                          style={{
                            background: `linear-gradient(to right, #78350f 0%, #78350f ${((brightness + 1) / 2) * 100}%, #1f2937 ${((brightness + 1) / 2) * 100}%, #1f2937 100%)`
                          }}
                        />
                        <div className="flex justify-between text-xs text-amber-400/50 mt-1">
                          <span>-1</span>
                          <span>0</span>
                          <span>+1</span>
                        </div>
                        <button
                          onClick={() => setBrightness(0)}
                          className="mt-2 w-full px-2 py-1 text-xs bg-amber-600/20 hover:bg-amber-600/30 text-amber-200 rounded border border-amber-600/50 transition-colors"
                        >
                          Reset
                        </button>
                      </div>
                      <div className="border-t border-amber-700/30 my-1"></div>
                      <button className="w-full px-4 py-2.5 text-left text-amber-100 hover:bg-amber-600/20 transition-colors opacity-50 cursor-not-allowed">Contrast (Coming soon)</button>
                      <button className="w-full px-4 py-2.5 text-left text-amber-100 hover:bg-amber-600/20 transition-colors opacity-50 cursor-not-allowed">Gamma (Coming soon)</button>
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
                      <button onClick={() => { setShowShortcutsModal(true); setMenuOpen(null); }} className="w-full px-4 py-2.5 text-left text-amber-100 hover:bg-amber-600/20 transition-colors">Shortcut menu</button>
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
      <div className="max-w-[1400px] mx-auto flex gap-6 ml-16">
        {/* Canvas Column */}
        <div className="flex flex-col items-start grow-[1]">
          <div className="flex items-center gap-3 mb-4">
            {/* <button onClick={() => navigate(-1)} className="bg-amber-900/20 border border-amber-600 text-amber-200 px-3 py-2 rounded hover:scale-105 transition">← Back</button> */}
            {/* <h2 className="text-2xl font-semibold text-amber-200">Annotating Project #{projectId}</h2> */}
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
              brightness={brightness}
            />
          </div>

        </div>

        {/* Annotate Panel (right) */}
        <aside className={`transition-all duration-300 ${panelVisible ? "w-[380px] max-h-[calc(100vh-8rem)]" : "w-0 p-0 pointer-events-none opacity-0"} rounded-xl border border-amber-500 bg-gradient-to-b from-black/80 to-neutral-900 shadow-lg flex flex-col overflow-hidden`}>
          {panelVisible && (
            <div className="w-[380px] h-full flex flex-col max-h-[calc(100vh-8rem)]">
              {/* Fixed Header */}
              <div className="flex-shrink-0 border-b border-amber-700/30">
                <div className="p-3 pb-2.5">
                  <h3 className="text-base font-semibold text-amber-100 mb-3 text-center">ANNOTATE</h3>
                  
                  {/* Tabs */}
                  {/* Tabs */}
<div className="flex gap-2">
  <button
    onClick={() => setAnnotateTab("create")}
    className={`flex-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 text-center ${
      annotateTab === "create"
        ? "bg-amber-500/20 border border-amber-400 text-amber-100 shadow-md"
        : "bg-black/60 border border-amber-600/20 text-amber-300 hover:bg-amber-800/20"
    }`}
  >
    Create
  </button>
  
  <button
    onClick={() => setAnnotateTab("edit")}
    className={`flex-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 text-center ${
      annotateTab === "edit"
        ? "bg-amber-500/20 border border-amber-400 text-amber-100 shadow-md"
        : "bg-black/60 border border-amber-600/20 text-amber-300 hover:bg-amber-800/20"
    }`}
  >
    Edit
  </button>
  
  {/* NEW REJECTIONS TAB */}
  <button
    onClick={() => {
      setAnnotateTab("rejections");
      fetchRejectionComments(); // Refresh comments when tab is clicked
    }}
    className={`flex-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 text-center relative ${
      annotateTab === "rejections"
        ? "bg-amber-500/20 border border-amber-400 text-amber-100 shadow-md"
        : "bg-black/60 border border-amber-600/20 text-amber-300 hover:bg-amber-800/20"
    }`}
  >
    Rejections
    {rejectionComments.length > 0 && (
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
        {rejectionComments.length}
      </span>
    )}
  </button>
</div>
                </div>
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3">
                {/* Create Tab */}
                {annotateTab === "create" && (
                  <div className="space-y-2.5">
                    <div className="text-xs text-amber-300/70 mb-2">
                      CLASSES: <span className="font-semibold text-amber-200">{classes.length}</span>
                    </div>
                    <div className="space-y-1.5">
                      {classes.map((c, idx) => (
                        <div
                          key={c.name}
                          className="flex items-center justify-between p-2 rounded-md border border-amber-700/30 bg-black/40 hover:border-amber-500 transition-all"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div
                              className="flex-shrink-0"
                              style={{
                                width: 10,
                                height: 10,
                                borderRadius: 5,
                                background: c.color || "#a67c00",
                              }}
                            />
                            <div className="text-xs font-medium text-amber-100 truncate">
                              {c.name}
                            </div>
                          </div>
                          <div className="text-xs text-amber-300/70 flex-shrink-0 ml-2">
                            {idx + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Edit Tab */}
                {annotateTab === "edit" && (
                  <div className="space-y-2.5">
                    <div className="text-xs text-amber-300/70 mb-2">
                      Selected per box
                    </div>
                    {rectData.length === 0 ? (
                      <div className="text-amber-300/60 text-xs">
                        No boxes yet.
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {rectData.map((r, idx) => (
                          <div
                            key={r.id}
                            className="flex items-start justify-between p-2 rounded-md border border-amber-700/30 bg-black/40 transition-all hover:bg-amber-900/20"
                          >
                            <div className="flex-1 min-w-0 pr-2">
                              <div className="text-xs font-medium text-amber-100 truncate">
                                {idx + 1}. {r.classes?.className || "—"}
                              </div>
                              <div className="text-xs text-amber-300/70 truncate mt-0.5">
                                {r.classes?.attributeName
                                  ? `${r.classes.attributeName}: ${r.classes.attributeValue || "-"}`
                                  : "No attribute"}
                              </div>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-xs text-amber-400/60 font-mono">ID: {r.id}</span>
                                <button
                                  onClick={() => handleCopyId(r.id)}
                                  title="Copy ID"
                                  className="p-0.5 text-amber-400/60 hover:text-amber-300 transition-colors"
                                >
                                  <Copy size={12} />
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <button
                                onClick={() => onEditPencilClick(r.id)}
                                title="Edit box"
                                className="p-1 text-amber-200/90 hover:text-amber-100 transition-colors"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteBox(r.id)}
                                title="Delete box"
                                className="p-1 text-amber-200/90 hover:text-amber-100 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Rejections Tab */}
                {annotateTab === "rejections" && (
                  <div className="space-y-3">
                    {/* Header with refresh button */}
                    <div className="flex items-center justify-between pb-2 border-b border-amber-600/30">
                      <h3 className="text-amber-200 text-sm font-semibold uppercase tracking-wide">
                        Rejection Comments
                      </h3>
                      <button
                        onClick={fetchRejectionComments}
                        disabled={loadingRejections}
                        className="px-2 py-1 text-[10px] bg-amber-600/20 hover:bg-amber-600/30 text-amber-200 rounded border border-amber-600/50 transition-colors disabled:opacity-50"
                        title="Refresh comments"
                      >
                        {loadingRejections ? "Loading..." : "Refresh"}
                      </button>
                    </div>

                    {/* Loading state */}
                    {loadingRejections && (
                      <div className="text-center py-8 text-amber-300/60 text-xs">
                        Loading rejection comments...
                      </div>
                    )}

                    {/* Empty state */}
                    {!loadingRejections && rejectionComments.length === 0 && (
                      <div className="text-center py-8 text-amber-300/60 text-xs">
                        <div className="mb-2">✓</div>
                        <div>No rejection comments for this file.</div>
                        <div className="mt-1 text-[10px]">This annotation hasn't been rejected.</div>
                      </div>
                    )}

                    {/* Comments list */}
                    {!loadingRejections && rejectionComments.length > 0 && (
                      <div className="space-y-3">
                        {rejectionComments.map((comment, idx) => (
                          <div
                            key={idx}
                            className="bg-black/40 border border-red-600/40 rounded-lg p-3 space-y-2"
                          >
                            {/* Comment header */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="flex-shrink-0 w-5 h-5 bg-red-600/20 border border-red-500/50 rounded-full flex items-center justify-center text-[10px] text-red-300 font-bold">
                                  {idx + 1}
                                </span>
                                <span className="text-[10px] text-amber-300/70 font-mono">
                                  Date: {comment.submitted_at || 'N/A'}
                                </span>
                              </div>
                              {comment.timestamp && (
                                <button
                                  onClick={() => copyToClipboard(
                                    new Date(comment.timestamp).toLocaleString(),
                                    "Timestamp"
                                  )}
                                  className="p-0.5 text-amber-400/60 hover:text-amber-300 transition-colors"
                                  title="Copy timestamp"
                                >
                                  <Copy size={12} />
                                </button>
                              )}
                            </div>

                            {/* Timestamp */}
                            {comment.timestamp && (
                              <div className="text-[10px] text-amber-300/50">
                                📅 {new Date(comment.timestamp).toLocaleString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit'
                                })}
                              </div>
                            )}

                            {/* Comment text */}
                            <div className="bg-black/60 border border-red-600/30 rounded p-2.5">
                              <p className="text-xs text-red-200 leading-relaxed whitespace-pre-wrap break-words">
                                {comment.comment || comment.description || 'No comment provided'}
                              </p>
                            </div>

                            {/* Reviewer info if available */}
                            {comment.reviewer_name && (
                              <div className="text-[10px] text-amber-300/60 flex items-center gap-1">
                                <span>👤</span>
                                <span>Reviewer: {comment.reviewer_name}</span>
                              </div>
                            )}

                            {/* Copy full comment button */}
                            <button
                              onClick={() => {
                                const fullText = `Rejection Comment #${idx + 1}\n` +
                                  `Timestamp: ${comment.timestamp ? new Date(comment.timestamp).toLocaleString() : 'N/A'}\n` +
                                  `Comment: ${comment.comment || comment.description || 'No comment'}\n` +
                                  (comment.reviewer_name ? `Reviewer: ${comment.reviewer_name}\n` : '');
                                copyToClipboard(fullText, "Comment details");
                              }}
                              className="w-full px-2 py-1.5 text-[10px] bg-amber-900/40 hover:bg-amber-800/50 text-amber-300 rounded border border-amber-600/30 transition-colors flex items-center justify-center gap-1"
                            >
                              <Copy size={10} />
                              Copy Comment Details
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Export all comments button */}
                    {rejectionComments.length > 0 && (
                      <button
                        onClick={() => {
                          const allComments = rejectionComments.map((c, i) => 
                            `Comment #${i + 1}\n` +
                            `Timestamp: ${c.timestamp ? new Date(c.timestamp).toLocaleString() : 'N/A'}\n` +
                            `Comment: ${c.comment || c.description || 'No comment'}\n` +
                            (c.reviewer_name ? `Reviewer: ${c.reviewer_name}\n` : '') +
                            '\n---\n'
                          ).join('\n');
                          copyToClipboard(allComments, "All rejection comments");
                        }}
                        className="w-full px-3 py-2 text-xs bg-red-600/20 hover:bg-red-600/30 text-red-200 rounded border border-red-600/50 transition-colors font-medium"
                      >
                        📋 Copy All Comments
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Fixed Bottom Actions */}
              <div className="flex-shrink-0 p-3 border-t border-amber-700/20 bg-gradient-to-b from-black/80 to-black/90">
                <div className="flex gap-1.5 w-full">
                  <button onClick={handleSaveAnnotation} disabled={isSaving} className="flex-1 px-2.5 py-1.5 rounded-md bg-amber-600 text-black text-xs font-semibold hover:shadow-lg transition transform active:scale-95 disabled:opacity-50 min-w-0">
                    {isSaving ? "Saving..." : "Save"}
                  </button>
                  <button onClick={handleSubmitAnnotation} disabled={rectData.length === 0} className={`flex-1 px-2.5 py-1.5 rounded-md text-xs font-semibold transition min-w-0 ${rectData.length === 0 ? "bg-amber-300 text-black/60 cursor-not-allowed" : "bg-black border border-amber-500 text-amber-200 hover:bg-amber-500/10"}`}>
                    Submit
                  </button>
                </div>
                <div className="mt-2 text-[10px] leading-tight text-amber-300/60 break-words">Tip: After drawing a box you will be prompted to choose class & attribute.</div>
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
                {/* {classes.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)} */}
                {classes
                    .filter((c) => c.shape === activeShapeType)  // 🔥 FILTER HERE
                    .map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
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

            <div className="text-xs text-amber-200 mb-4 flex items-center justify-between group">
              <div>
                <strong className="text-amber-300">Project name:</strong> {projectName || "N/A"}
              </div>
              {projectName && (
                <button onClick={() => copyToClipboard(projectName, "Project name")} className="p-1.5 hover:bg-amber-600/20 rounded transition-colors opacity-0 group-hover:opacity-100" title="Copy Project name">
                  <Copy size={14} className="text-amber-300" />
                </button>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowTaskModal(false)} className="px-3 py-2 rounded-md border border-amber-600 text-amber-200 text-xs">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Annotation Data Modal */}
      {showAnnotationDataModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowAnnotationDataModal(false)} />
          <div className="relative bg-gradient-to-b from-neutral-900 to-black rounded-lg shadow-2xl w-[90vw] max-w-6xl max-h-[90vh] overflow-hidden z-10 border border-amber-600/40 flex flex-col">
            <div className="flex-shrink-0 p-4 border-b border-amber-700/30">
              <h4 className="text-lg font-semibold text-amber-100">Annotation Data</h4>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {rectData.length === 0 ? (
                <p className="text-amber-300/60 text-center py-8">No annotations drawn yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-left">
                    <thead className="bg-amber-900/20 text-amber-100 font-semibold sticky top-0">
                      <tr>
                        <th className="px-4 py-3">#</th>
                        <th className="px-4 py-3">ID</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">X</th>
                        <th className="px-4 py-3">Y</th>
                        <th className="px-4 py-3">Width</th>
                        <th className="px-4 py-3">Height</th>
                        <th className="px-4 py-3">Points</th>
                        <th className="px-4 py-3">Class</th>
                        <th className="px-4 py-3">Attribute Name</th>
                        <th className="px-4 py-3">Attribute Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-700/30">
                      {rectData.map((box, index) => (
                        <tr key={box.id} className={`${index % 2 === 0 ? "bg-black/30" : "bg-black/20"} hover:bg-amber-900/30 transition`}>
                          <td className="px-4 py-3 font-medium text-amber-100">{index + 1}</td>
                          <td className="px-4 py-3 text-amber-200 font-mono text-xs">{box.id}</td>
                          <td className="px-4 py-3 text-amber-300 capitalize">{box.type || "rectangle"}</td>
                          {box.type === "rectangle" || !box.type ? (
                            <>
                              <td className="px-4 py-3 text-amber-200">{Number(box.x || 0).toFixed(1)}</td>
                              <td className="px-4 py-3 text-amber-200">{Number(box.y || 0).toFixed(1)}</td>
                              <td className="px-4 py-3 text-amber-200">{Number(box.width || 0).toFixed(1)}</td>
                              <td className="px-4 py-3 text-amber-200">{Number(box.height || 0).toFixed(1)}</td>
                              <td className="px-4 py-3 text-amber-300/60">-</td>
                            </>
                          ) : (
                            <>
                              <td className="px-4 py-3 text-amber-300/60">-</td>
                              <td className="px-4 py-3 text-amber-300/60">-</td>
                              <td className="px-4 py-3 text-amber-300/60">-</td>
                              <td className="px-4 py-3 text-amber-300/60">-</td>
                              <td className="px-4 py-3">
                                {Array.isArray(box.points) && box.points.length > 0 ? (
                                  <div className="flex items-center gap-2">
                                    <span className="text-amber-200 font-mono text-xs">{`${box.points.length / 2} points`}</span>
                                    <button
                                      onClick={() => setViewingPointsFor(box.id)}
                                      className="px-2 py-1 text-xs bg-amber-600/20 hover:bg-amber-600/30 text-amber-200 rounded border border-amber-600/50 transition-colors"
                                      title="View points data"
                                    >
                                      View
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-amber-300/60">-</span>
                                )}
                              </td>
                            </>
                          )}
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
            <div className="flex-shrink-0 p-4 border-t border-amber-700/30 flex justify-end">
              <button onClick={() => setShowAnnotationDataModal(false)} className="px-4 py-2 rounded-md border border-amber-600 text-amber-200 text-sm hover:bg-amber-600/20 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Shortcuts Modal */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowShortcutsModal(false)} />
          <div className="relative bg-gradient-to-b from-neutral-900 to-black rounded-lg shadow-2xl w-[90vw] max-w-5xl max-h-[90vh] overflow-hidden z-10 border border-amber-600/40 flex flex-col">
            <div className="flex-shrink-0 p-4 border-b border-amber-700/30 flex items-center justify-between">
              <h4 className="text-lg font-semibold text-amber-100">Keyboard Shortcuts</h4>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="px-3 py-1.5 text-xs bg-amber-600/20 hover:bg-amber-600/30 text-amber-200 rounded border border-amber-600/50 transition-colors"
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Common Shortcuts Column */}
                <div>
                  <h5 className="text-base font-semibold text-amber-200 mb-4 pb-2 border-b border-amber-700/30">Common Shortcuts</h5>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-amber-800/20">
                      <span className="text-amber-300 font-mono bg-black/40 px-2 py-1 rounded">Ctrl + S</span>
                      <span className="text-amber-100">Save annotation</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-amber-800/20">
                      <span className="text-amber-300 font-mono bg-black/40 px-2 py-1 rounded">Ctrl + A</span>
                      <span className="text-amber-100">Submit annotation</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-amber-800/20">
                      <span className="text-amber-300 font-mono bg-black/40 px-2 py-1 rounded">H</span>
                      <span className="text-amber-100">Hide / Unhide all annotation</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-amber-800/20">
                      <span className="text-amber-300 font-mono bg-black/40 px-2 py-1 rounded">Esc</span>
                      <span className="text-amber-100">Unfinish the label</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-amber-800/20">
                      <span className="text-amber-300 font-mono bg-black/40 px-2 py-1 rounded">1</span>
                      <span className="text-amber-100">Create a new Polygon</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-amber-800/20">
                      <span className="text-amber-300 font-mono bg-black/40 px-2 py-1 rounded">2</span>
                      <span className="text-amber-100">Create a new Polyline</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-amber-800/20">
                      <span className="text-amber-300 font-mono bg-black/40 px-2 py-1 rounded">3</span>
                      <span className="text-amber-100">Create a new Rectangle</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-amber-800/20">
                      <span className="text-amber-300 font-mono bg-black/40 px-2 py-1 rounded">4</span>
                      <span className="text-amber-100">Create a new Cuboid</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-amber-800/20">
                      <span className="text-amber-300 font-mono bg-black/40 px-2 py-1 rounded">5</span>
                      <span className="text-amber-100">Create a new Line</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-amber-800/20">
                      <span className="text-amber-300 font-mono bg-black/40 px-2 py-1 rounded">6</span>
                      <span className="text-amber-100">Create a new Keypoint</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-amber-800/20">
                      <span className="text-amber-300 font-mono bg-black/40 px-2 py-1 rounded">7</span>
                      <span className="text-amber-100">Create a new point</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-amber-800/20">
                      <span className="text-amber-300 font-mono bg-black/40 px-2 py-1 rounded">Scroll</span>
                      <span className="text-amber-100">Zoom in/out</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-amber-800/20">
                      <span className="text-amber-300 font-mono bg-black/40 px-2 py-1 rounded">Ctrl + D</span>
                      <span className="text-amber-100">Increase height of the Rectangle</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-amber-800/20">
                      <span className="text-amber-300 font-mono bg-black/40 px-2 py-1 rounded">Ctrl + F</span>
                      <span className="text-amber-100">Increase width of the Rectangle</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-amber-800/20">
                      <span className="text-amber-300 font-mono bg-black/40 px-2 py-1 rounded">A</span>
                      <span className="text-amber-100">Move the rectangle to left</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-amber-800/20">
                      <span className="text-amber-300 font-mono bg-black/40 px-2 py-1 rounded">S</span>
                      <span className="text-amber-100">Move the rectangle to bottom</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-amber-800/20">
                      <span className="text-amber-300 font-mono bg-black/40 px-2 py-1 rounded">D</span>
                      <span className="text-amber-100">Move the rectangle to right</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-amber-800/20">
                      <span className="text-amber-300 font-mono bg-black/40 px-2 py-1 rounded">W</span>
                      <span className="text-amber-100">Move the rectangle to top</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-amber-800/20">
                      <span className="text-amber-300 font-mono bg-black/40 px-2 py-1 rounded">L</span>
                      <span className="text-amber-100">Display the Label summary window</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-amber-800/20">
                      <span className="text-amber-300 font-mono bg-black/40 px-2 py-1 rounded">Mouse left button</span>
                      <span className="text-amber-100">Double click in the line creates nodes in Polyline & Polygon</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-amber-800/20">
                      <span className="text-amber-300 font-mono bg-black/40 px-2 py-1 rounded">Mouse right button</span>
                      <span className="text-amber-100">Removes nodes in Polyline & Polygon</span>
                    </div>
                  </div>
                </div>

                {/* 3D - Pointcloud & Video Column */}
                <div>
                  <h5 className="text-base font-semibold text-amber-200 mb-4 pb-2 border-b border-amber-700/30">3D - Pointcloud</h5>
                  <div className="space-y-3 text-sm mb-6">
                    <div className="flex justify-between items-center py-2 border-b border-amber-800/20">
                      <span className="text-amber-300 font-mono bg-black/40 px-2 py-1 rounded">Alt + A</span>
                      <span className="text-amber-100">Move left in the point cloud</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-amber-800/20">
                      <span className="text-amber-300 font-mono bg-black/40 px-2 py-1 rounded">Alt + S</span>
                      <span className="text-amber-100">Move rear in the point cloud</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-amber-800/20">
                      <span className="text-amber-300 font-mono bg-black/40 px-2 py-1 rounded">Alt + D</span>
                      <span className="text-amber-100">Move right in the point cloud</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-amber-800/20">
                      <span className="text-amber-300 font-mono bg-black/40 px-2 py-1 rounded">Alt + W</span>
                      <span className="text-amber-100">Move front in the point cloud</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-amber-800/20">
                      <span className="text-amber-300 font-mono bg-black/40 px-2 py-1 rounded">Q + Scroll</span>
                      <span className="text-amber-100">Elliptical rotate</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-amber-800/20">
                      <span className="text-amber-300 font-mono bg-black/40 px-2 py-1 rounded">E + Scroll</span>
                      <span className="text-amber-100">Helicopter rotate</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-amber-800/20">
                      <span className="text-amber-300 font-mono bg-black/40 px-2 py-1 rounded">X</span>
                      <span className="text-amber-100">Resize the sides of cuboid</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-amber-800/20">
                      <span className="text-amber-300 font-mono bg-black/40 px-2 py-1 rounded">C</span>
                      <span className="text-amber-100">Resize the height of cuboid</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-amber-800/20">
                      <span className="text-amber-300 font-mono bg-black/40 px-2 py-1 rounded">Q</span>
                      <span className="text-amber-100">Rotate the sides of cuboid</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-amber-800/20">
                      <span className="text-amber-300 font-mono bg-black/40 px-2 py-1 rounded">E</span>
                      <span className="text-amber-100">Tilt the cuboid in 1 degree</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-amber-800/20">
                      <span className="text-amber-300 font-mono bg-black/40 px-2 py-1 rounded">Ctrl + Q</span>
                      <span className="text-amber-100">Rotate the sides of cuboid in 1 degree</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-amber-800/20">
                      <span className="text-amber-300 font-mono bg-black/40 px-2 py-1 rounded">G</span>
                      <span className="text-amber-100">Hide/Unhide Grid window</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-amber-800/20">
                      <span className="text-amber-300 font-mono bg-black/40 px-2 py-1 rounded">P</span>
                      <span className="text-amber-100">Switch to 3D view</span>
                    </div>
                  </div>

                  <h5 className="text-base font-semibold text-amber-200 mb-4 pb-2 border-b border-amber-700/30 mt-6">Video file</h5>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-amber-800/20">
                      <span className="text-amber-300 font-mono bg-black/40 px-2 py-1 rounded">Right arrow</span>
                      <span className="text-amber-100">Next frame (Video file)</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-amber-800/20">
                      <span className="text-amber-300 font-mono bg-black/40 px-2 py-1 rounded">Left arrow</span>
                      <span className="text-amber-100">Previous frame (Video file)</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-amber-800/20">
                      <span className="text-amber-300 font-mono bg-black/40 px-2 py-1 rounded">Ctrl + [</span>
                      <span className="text-amber-100">Keyframe start (Video file)</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-amber-800/20">
                      <span className="text-amber-300 font-mono bg-black/40 px-2 py-1 rounded">Ctrl + ]</span>
                      <span className="text-amber-100">Keyframe end (Video file)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0 p-4 border-t border-amber-700/30 flex justify-end">
              <button onClick={() => setShowShortcutsModal(false)} className="px-4 py-2 rounded-md border border-amber-600 text-amber-200 text-sm hover:bg-amber-600/20 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Points Data Modal */}
      {viewingPointsFor && (() => {
        const shape = rectData.find(b => b.id === viewingPointsFor);
        if (!shape || !Array.isArray(shape.points) || shape.points.length === 0) {
          setViewingPointsFor(null);
          return null;
        }
        const pointPairs = [];
        for (let i = 0; i < shape.points.length; i += 2) {
          pointPairs.push({ x: shape.points[i], y: shape.points[i + 1] });
        }
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/70" onClick={() => setViewingPointsFor(null)} />
            <div className="relative bg-gradient-to-b from-neutral-900 to-black rounded-lg shadow-2xl w-[90vw] max-w-4xl max-h-[80vh] overflow-hidden z-10 border border-amber-600/40 flex flex-col">
              <div className="flex-shrink-0 p-4 border-b border-amber-700/30 flex items-center justify-between">
                <h4 className="text-lg font-semibold text-amber-100">
                  Points Data - {shape.type || "shape"} (ID: {shape.id})
                </h4>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(shape.points, null, 2), "Points data")}
                  className="px-3 py-1.5 text-xs bg-amber-600/20 hover:bg-amber-600/30 text-amber-200 rounded border border-amber-600/50 transition-colors"
                >
                  Copy All Points
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {pointPairs.map((point, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-md border border-amber-700/30 bg-black/40 hover:border-amber-500 transition-all"
                    >
                      <div className="text-xs text-amber-300/70 mb-1">Point {idx + 1}</div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-mono text-amber-200">
                          X: {Number(point.x).toFixed(2)}
                        </div>
                        <div className="text-sm font-mono text-amber-200">
                          Y: {Number(point.y).toFixed(2)}
                        </div>
                        <button
                          onClick={() => copyToClipboard(`(${Number(point.x).toFixed(2)}, ${Number(point.y).toFixed(2)})`, `Point ${idx + 1}`)}
                          className="p-1 text-amber-400/60 hover:text-amber-300 transition-colors"
                          title="Copy point"
                        >
                          <Copy size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-shrink-0 p-4 border-t border-amber-700/30 flex justify-end">
                <button onClick={() => setViewingPointsFor(null)} className="px-4 py-2 rounded-md border border-amber-600 text-amber-200 text-sm hover:bg-amber-600/20 transition-colors">Close</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
