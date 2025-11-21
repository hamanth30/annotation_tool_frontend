import React, { useRef, useState, useEffect } from "react";
import { Stage, Layer, Rect, Image } from "react-konva";

/**
 * Controlled DrawRect:
 * - Props:
 *   - width, height: canvas size
 *   - imageUrl: image to draw beneath
 *   - rectData: array of existing rects [{id, x, y, width, height, classes}]
 *   - onChange: callback(updatedRectArray) when rectangles change (new rect added / user draws)
 *
 * Notes:
 * - New rectangles are created with normalized coordinates (x,y,width,height).
 * - Each new rect receives an id: Date.now().toString() + Math.random() for safety.
 */
export default function DrawRect({ width, height, imageUrl, rectData = [], onChange }) {
  const [image, setImage] = useState(null);
  const [newRect, setNewRect] = useState(null);
  const isDrawing = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!imageUrl) {
      setImage(null);
      return;
    }
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
      setImage(img);
      console.log("Image loaded successfully:", imageUrl);
    };
    img.onerror = (e) => {
      console.error("Image failed to load:", e);
      setImage(null);
    };
  }, [imageUrl]);

  const handleMouseDown = (e) => {
    if (!image) return;
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    isDrawing.current = true;
    startPos.current = pos;
    setNewRect({ x: pos.x, y: pos.y, width: 0, height: 0 });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current || !newRect) return;
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    setNewRect({
      x: startPos.current.x,
      y: startPos.current.y,
      width: pos.x - startPos.current.x,
      height: pos.y - startPos.current.y,
    });
  };

  const handleMouseUp = (e) => {
    if (!isDrawing.current || !newRect) {
      isDrawing.current = false;
      setNewRect(null);
      return;
    }

    // Normalize coordinates so width/height positive and x,y top-left
    const raw = newRect;
    const absWidth = Math.abs(raw.width);
    const absHeight = Math.abs(raw.height);
    const normX = raw.width >= 0 ? raw.x : raw.x + raw.width;
    const normY = raw.height >= 0 ? raw.y : raw.y + raw.height;

    // ignore tiny boxes
    if (absWidth > 8 && absHeight > 8) {
      const id = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      const rectToAdd = { id, x: normX, y: normY, width: absWidth, height: absHeight, classes: { className: "", attribute: "" } };
      // push to parent's rectData via onChange
      const updated = [...rectData, rectToAdd];
      onChange && onChange(updated);
    }

    setNewRect(null);
    isDrawing.current = false;
  };

  return (
    <Stage
      width={width}
      height={height}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="border border-gray-300 rounded shadow-md"
    >
      <Layer>
        {image && <Image image={image} width={width} height={height} />}
        {/* render existing rects (controlled by parent) */}
        {rectData.map((rect) => (
          <Rect
            key={rect.id}
            x={rect.x}
            y={rect.y}
            width={rect.width}
            height={rect.height}
            stroke="red"
            strokeWidth={2}
          />
        ))}

        {/* live drawing preview */}
        {newRect && (
          <Rect
            x={newRect.width >= 0 ? newRect.x : newRect.x + newRect.width}
            y={newRect.height >= 0 ? newRect.y : newRect.y + newRect.height}
            width={Math.abs(newRect.width)}
            height={Math.abs(newRect.height)}
            stroke="blue"
            dash={[6, 4]}
          />
        )}
      </Layer>
    </Stage>
  );
}
