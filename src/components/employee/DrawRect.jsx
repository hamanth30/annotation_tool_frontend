import React, { useRef, useState, useEffect } from "react";
import { Stage, Layer, Rect, Image, Transformer, Text, Group } from "react-konva";

export default function DrawRect({ width, height, imageUrl, rectData = [], onChange, drawEnabled = true }) {
  const [image, setImage] = useState(null);
  const [newRect, setNewRect] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const trRef = useRef();

  useEffect(() => {
    if (!imageUrl) return setImage(null);
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => setImage(img);
  }, [imageUrl]);

  // attach transformer to selected shape
  useEffect(() => {
    if (trRef.current) {
      const stage = trRef.current.getStage();
      const selectedNode = selectedId ? stage.findOne(`#rect-${selectedId}`) : null;
      trRef.current.nodes(selectedNode ? [selectedNode] : []);
      trRef.current.getLayer() && trRef.current.getLayer().batchDraw();
    }
  }, [selectedId, rectData]);

  // ---------------- DRAW NEW RECT ----------------
  const isDrawing = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    // if clicked on existing shape, don't draw new
    const clickedId = e.target?.attrs?.id || "";
    if (clickedId.startsWith("rect-")) {
      // select existing
      const id = clickedId.replace("rect-", "");
      setSelectedId(id);
      return;
    }

    // respect drawEnabled flag
    if (!drawEnabled) return;

    const pos = e.target.getStage().getPointerPosition();
    isDrawing.current = true;
    startPos.current = pos;
    setNewRect({ x: pos.x, y: pos.y, width: 0, height: 0 });
    // deselect existing if starting new
    setSelectedId(null);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current || !newRect) return;
    const pos = e.target.getStage().getPointerPosition();

    setNewRect({
      x: startPos.current.x,
      y: startPos.current.y,
      width: pos.x - startPos.current.x,
      height: pos.y - startPos.current.y,
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing.current || !newRect) {
      isDrawing.current = false;
      return;
    }

    const raw = newRect;
    const absWidth = Math.abs(raw.width);
    const absHeight = Math.abs(raw.height);
    const normX = raw.width >= 0 ? raw.x : raw.x + raw.width;
    const normY = raw.height >= 0 ? raw.y : raw.y + raw.height;

    if (absWidth > 8 && absHeight > 8) {
      const id = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      const updated = [
        ...rectData,
        { id, x: normX, y: normY, width: absWidth, height: absHeight, classes: { className: "", attributeName: "", attributeValue: "" } }
      ];
      onChange && onChange(updated);
    }

    isDrawing.current = false;
    setNewRect(null);
  };

  // ---------------- DRAG / RESIZE HANDLERS ----------------
  const handleDragMove = (id, e) => {
    const node = e.target;
    const updated = rectData.map(r => r.id === id ? { ...r, x: node.x(), y: node.y(), width: r.width, height: r.height } : r );
    onChange && onChange(updated);
  };

  const handleTransform = (id, e) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    const newWidth = Math.max(10, node.width() * scaleX);
    const newHeight = Math.max(10, node.height() * scaleY);

    node.scaleX(1);
    node.scaleY(1);

    const updated = rectData.map(r => r.id === id ? { ...r, x: node.x(), y: node.y(), width: newWidth, height: newHeight } : r);
    onChange && onChange(updated);
  };

  return (
    <Stage
      width={width}
      height={height}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ cursor: drawEnabled ? "crosshair" : "default" }}
    >
      <Layer>
        {image && <Image image={image} width={width} height={height} />}

        {rectData.map((rect, idx) => (
          <Group
            key={rect.id}
            id={`rect-${rect.id}`}
            draggable
            x={rect.x}
            y={rect.y}
            onClick={() => setSelectedId(rect.id)}
            onTap={() => setSelectedId(rect.id)}
            onDragMove={(e) => handleDragMove(rect.id, e)}
            onTransformEnd={(e) => handleTransform(rect.id, e)}
          >
            <Rect
              width={rect.width}
              height={rect.height}
              fill={selectedId === rect.id ? "rgba(166,124,0,0.12)" : "rgba(166,124,0,0.06)"}
              stroke={selectedId === rect.id ? "#ab7a00" : "#d4a800"}
              strokeWidth={2}
              cornerRadius={4}
              name="drawnRect"
            />

            {/* BOX NUMBER LABEL */}
            <Text
              text={`#${idx + 1}`}
              x={6}
              y={rect.height - 18}
              fontSize={13}
              fill="#d4a800"
            />
          </Group>
        ))}

        {/* TRANSFORMER */}
        <Transformer
          ref={trRef}
          rotateEnabled={false}
          anchorSize={6}
          padding={6}
          borderStroke="#ab7a00"
          anchorStroke="#ab7a00"
          anchorFill="#1f1a09"
          anchorCornerRadius={3}
          enabledAnchors={[
            "top-left",
            "top-right",
            "bottom-left",
            "bottom-right",
            "top-center",
            "bottom-center",
            "middle-left",
            "middle-right"
          ]}
        />

        {/* PREVIEW WHILE DRAWING */}
        {newRect && (
          <Rect
            x={newRect.width >= 0 ? newRect.x : newRect.x + newRect.width}
            y={newRect.height >= 0 ? newRect.y : newRect.y + newRect.height}
            width={Math.abs(newRect.width)}
            height={Math.abs(newRect.height)}
            stroke="#4aa3ff"
            dash={[6, 4]}
          />
        )}
      </Layer>
    </Stage>
  );
}
