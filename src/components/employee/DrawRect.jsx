import React, { useRef, useState, useEffect } from "react";
import { Stage, Layer, Rect, Image } from "react-konva";

export default function DrawRect({ width, height, imageUrl, onChange }) {
  const [image, setImage] = useState(null);
  const [rects, setRects] = useState([]);
  const [newRect, setNewRect] = useState(null);
  const isDrawing = useRef(false);

  useEffect(() => {
    const img = new window.Image();
    img.src = imageUrl;
    img.onload = () => {
      setImage(img);
      console.log("Image loaded successfully:", imageUrl);
    };
  }, [imageUrl]);

  const handleMouseDown = (e) => {
    if (!image) return;
    const { x, y } = e.target.getStage().getPointerPosition();
    isDrawing.current = true;
    setNewRect({ x, y, width: 0, height: 0 });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current || !newRect) return;
    const { x, y } = e.target.getStage().getPointerPosition();
    setNewRect({
      ...newRect,
      width: x - newRect.x,
      height: y - newRect.y,
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing.current) return;
    if (newRect && Math.abs(newRect.width) > 10 && Math.abs(newRect.height) > 10) {
      const updated = [...rects, newRect];
      setRects(updated);
      onChange(updated);
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
        {rects.map((rect, i) => (
          <Rect
            key={i}
            x={rect.x}
            y={rect.y}
            width={rect.width}
            height={rect.height}
            stroke="red"
            strokeWidth={2}
          />
        ))}
        {newRect && (
          <Rect
            x={newRect.x}
            y={newRect.y}
            width={newRect.width}
            height={newRect.height}
            stroke="blue"
            dash={[4, 2]}
          />
        )}
      </Layer>
    </Stage>
  );
}
