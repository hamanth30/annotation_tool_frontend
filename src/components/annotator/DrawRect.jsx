import React, { useRef, useState, useCallback } from "react";
import { Stage, Layer, Rect } from "react-konva";
import { FiMousePointer } from "react-icons/fi";
import { BsSquare } from "react-icons/bs";
import { RiDeleteBinLine } from "react-icons/ri";
import { AiOutlineCheck } from "react-icons/ai";

/**
 * DrawRect
 * A simple Konva drawing component that allows drawing multiple rectangles.
 * - Initializes new rects with width:1, height:1
 * - Tracks drawing state via isPaintRef
 * - Handles onMouseDown, onMouseMove, onMouseUp on the Stage
 * - Keeps rects in an array and renders them via map
 *
 * Usage: <DrawRect width={800} height={600} />
 */
export default function DrawRect({ width = 800, height = 600, onChange }) {
  // track if user is currently drawing
  const isPaintRef = useRef(false);

  // toolbar tool: 'cursor' | 'rect'
  const [tool, setTool] = useState("cursor");
  const [saved, setSaved] = useState(false);

  // array of rects: each rect { id, x, y, width, height, stroke, strokeWidth }
  const [rects, setRects] = useState([]);

  // helper to get pointer position safely
  const getPointerPos = useCallback((stage) => {
    if (!stage) return { x: 0, y: 0 };
    const pos = stage.getPointerPosition();
    return pos || { x: 0, y: 0 };
  }, []);

  const handleMouseDown = (e) => {
    // only start drawing when rect tool is selected
    if (tool !== "rect") return;
    // start drawing
    isPaintRef.current = true;
    const stage = e.target.getStage();
    const pos = getPointerPos(stage);

    // initialize new rect with width:1 height:1
    const newRect = {
      id: `r_${Date.now()}`,
      x: pos.x,
      y: pos.y,
      width: 1,
      height: 1,
      stroke: "#00aaff",
      strokeWidth: 2,
    };

    setRects((prev) => [...prev, newRect]);
  };

  const handleMouseMove = (e) => {
    // if not drawing, ignore
    if (!isPaintRef.current) return;

    const stage = e.target.getStage();
    const pos = getPointerPos(stage);

    // update last rect using prev state
    setRects((prev) => {
      if (prev.length === 0) return prev;
      const rectsCopy = prev.slice();
      const last = rectsCopy[rectsCopy.length - 1];

      // update width/height relative to initial x,y
      last.width = pos.x - last.x;
      last.height = pos.y - last.y;

      return rectsCopy;
    });
  };

  const handleMouseUp = (e) => {
    if (!isPaintRef.current) return;
    isPaintRef.current = false;

    // normalize rectangles so width/height are positive and x,y adjusted
    setRects((prev) => {
      const normalized = prev.map((r) => {
        const nx = r.width < 0 ? r.x + r.width : r.x;
        const ny = r.height < 0 ? r.y + r.height : r.y;
        const nw = Math.abs(r.width);
        const nh = Math.abs(r.height);
        return { ...r, x: nx, y: ny, width: nw, height: nh };
      });

      // optional callback to notify parent
      if (typeof onChange === "function") onChange(normalized);

      return normalized;
    });
  };

  const clearAll = () => {
    setRects([]);
    if (typeof onChange === "function") onChange([]);
  };

  const handleSave = () => {
    if (typeof onChange === "function") onChange(rects);
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
    console.log("Saved rects:", rects);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Toolbar - top center */}
      <div className="flex items-center gap-3 mt-4 mb-3">
        <button
          onClick={() => setTool("cursor")}
          className={`px-3 py-2 rounded-md border ${tool === "cursor" ? "bg-gray-200" : "bg-white"}`}
          title="Cursor"
        >
          <FiMousePointer className="w-5 h-5" />
        </button>

        <button
          onClick={() => setTool("rect")}
          className={`px-3 py-2 rounded-md border ${tool === "rect" ? "bg-gray-200" : "bg-white"}`}
          title="Rectangle"
        >
          <BsSquare className="w-5 h-5" />
        </button>

        <button onClick={clearAll} className="px-3 py-2 rounded-md border bg-white" title="Clear all">
          <RiDeleteBinLine className="w-5 h-5 text-red-600" />
        </button>

        <button onClick={handleSave} className="px-3 py-2 rounded-md border bg-green-500 text-white" title="Save">
          <AiOutlineCheck className="w-5 h-5" />
        </button>

        {saved && <div className="text-sm text-green-600 ml-2">Saved</div>}
      </div>

      {/* Canvas centered */}
      <div style={{ border: "1px solid #ddd", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ display: "inline-block" }}>
          <div className="mt-2 font-bold text-lg text-center mb-2">Annotate images</div>
          <Stage
            width={width}
            height={height}
            onMouseDown={handleMouseDown}
            onMousemove={handleMouseMove}
            onMouseup={handleMouseUp}
            style={{ background: "transparent", cursor: tool === "rect" ? "crosshair" : "default" }}
          >
            <Layer>
              {rects.map((r) => {
                // compute display values so rect works even if user dragged negative
                const displayX = r.width < 0 ? r.x + r.width : r.x;
                const displayY = r.height < 0 ? r.y + r.height : r.y;
                const displayW = Math.abs(r.width);
                const displayH = Math.abs(r.height);

                return (
                  <Rect
                    key={r.id}
                    x={displayX}
                    y={displayY}
                    width={displayW}
                    height={displayH}
                    stroke={r.stroke}
                    strokeWidth={r.strokeWidth}
                    dash={[4, 4]}
                    listening={false}
                  />
                );
              })}
            </Layer>
          </Stage>
        </div>
      </div>
    </div>
  );
}
