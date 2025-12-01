
import React, { useRef, useState, useEffect } from "react";
import { Stage, Layer, Rect, Image, Transformer, Text, Group, Line, Shape } from "react-konva";

/**
 * DrawRect
 * props:
 *  - width, height
 *  - imageUrl
 *  - rectData (array of shapes: rects, polylines, polygons)
 *  - onChange(updatedShapes)
 *  - drawEnabled (boolean)
 *  - mode: "cursor" | "rectangle" | "polygon" | "polyline"
 *  - boxColor: hex color string for new shapes
 */
export default function DrawRect({
  width,
  height,
  imageUrl,
  rectData = [],
  onChange,
  drawEnabled = true,
  mode = "rectangle",
  boxColor = "#d4a800",
}) {
  const [image, setImage] = useState(null);
  const [newRect, setNewRect] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [polygonPoints, setPolygonPoints] = useState([]);
  const [isDrawingPolygon, setIsDrawingPolygon] = useState(false);
  const trRef = useRef();
  const layerRef = useRef();
  const isDraggingRef = useRef(false);
  const isTransformingRef = useRef(false);

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
      const selectedNode = selectedId 
        ? (stage.findOne(`#rect-${selectedId}`) || stage.findOne(`#poly-${selectedId}`)) 
        : null;
      trRef.current.nodes(selectedNode ? [selectedNode] : []);
      trRef.current.getLayer() && trRef.current.getLayer().batchDraw();
    }
  }, [selectedId, rectData]);

  // Reset polygon drawing when mode changes
  useEffect(() => {
    if (mode !== "polygon" && mode !== "polyline") {
      setPolygonPoints([]);
      setIsDrawingPolygon(false);
    }
  }, [mode]);

  // ---------------- DRAW NEW RECT ----------------
  const isDrawing = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    // Don't start drawing if currently dragging or transforming
    if (isDraggingRef.current || isTransformingRef.current) {
      return;
    }

    const stage = e.target.getStage();
    const clickedOnEmpty = e.target === stage || e.target.getClassName() === 'Image';

    // Check if clicked on existing shape or its children
    let target = e.target;
    while (target) {
      const targetId = target.attrs?.id || "";
      if (targetId.startsWith("rect-") || targetId.startsWith("poly-")) {
        const id = targetId.replace("rect-", "").replace("poly-", "");
        setSelectedId(id);
        return;
      }
      target = target.parent;
    }

    // Deselect if clicking on empty space
    if (clickedOnEmpty) {
      setSelectedId(null);

      // Handle rectangle drawing
      if (drawEnabled && mode === "rectangle") {
        const pos = stage.getPointerPosition();
        isDrawing.current = true;
        startPos.current = pos;
        setNewRect({ x: pos.x, y: pos.y, width: 0, height: 0 });
      }
      // Handle polygon/polyline drawing
      else if (drawEnabled && (mode === "polygon" || mode === "polyline")) {
        const pos = stage.getPointerPosition();
        if (!isDrawingPolygon) {
          setIsDrawingPolygon(true);
          setPolygonPoints([pos]);
        } else {
          // Check if clicking near the first point to close polygon
          if (polygonPoints.length >= 2 && mode === "polygon") {
            const firstPoint = polygonPoints[0];
            const distance = Math.sqrt(
              Math.pow(pos.x - firstPoint.x, 2) + Math.pow(pos.y - firstPoint.y, 2)
            );
            if (distance < 10) {
              // Close polygon
              finishPolygon();
              return;
            }
          }
          setPolygonPoints([...polygonPoints, pos]);
        }
      }
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current || !newRect || isDraggingRef.current) return;
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
        {
          id,
          type: "rectangle",
          x: normX,
          y: normY,
          width: absWidth,
          height: absHeight,
          classes: { className: "", attributeName: "", attributeValue: "" },
          color: boxColor,
        },
      ];
      onChange && onChange(updated);
    }

    isDrawing.current = false;
    setNewRect(null);
  };

  // Finish polygon/polyline drawing
  const finishPolygon = () => {
    if (polygonPoints.length < 2) {
      setPolygonPoints([]);
      setIsDrawingPolygon(false);
      return;
    }

    const id = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const points = polygonPoints.flatMap(p => [p.x, p.y]);
    
    // For polygon, close the shape by adding first point at the end
    if (mode === "polygon" && polygonPoints.length >= 3) {
      const firstPoint = polygonPoints[0];
      points.push(firstPoint.x, firstPoint.y);
    }

    const updated = [
      ...rectData,
      {
        id,
        type: mode === "polygon" ? "polygon" : "polyline",
        points: points,
        classes: { className: "", attributeName: "", attributeValue: "" },
        color: boxColor,
      },
    ];
    onChange && onChange(updated);

    setPolygonPoints([]);
    setIsDrawingPolygon(false);
  };

  // Handle double-click to finish polygon/polyline
  const handleDoubleClick = () => {
    if (isDrawingPolygon && (mode === "polygon" || mode === "polyline")) {
      finishPolygon();
    }
  };

  // ---------------- DRAG / RESIZE HANDLERS ----------------
  const handleDragStart = () => {
    isDraggingRef.current = true;
  };

  const handleDragEnd = () => {
    isDraggingRef.current = false;
  };

  const handleDragMove = (id, e) => {
    const node = e.target;
    const shape = rectData.find((r) => r.id === id);
    if (!shape) return;

    if (shape.type === "rectangle" || !shape.type) {
      const updated = rectData.map((r) =>
        r.id === id ? { ...r, x: node.x(), y: node.y() } : r
      );
      onChange && onChange(updated);
    } else if (shape.type === "polygon" || shape.type === "polyline") {
      // For polygons/polylines, the Group is positioned at minX/minY
      // So we need to update all points by the drag offset
      const dx = node.x();
      const dy = node.y();
      const updatedPoints = (shape.points || []).map((p, i) => 
        i % 2 === 0 ? p + dx : p + dy
      );
      const updated = rectData.map((r) =>
        r.id === id ? { ...r, points: updatedPoints } : r
      );
      onChange && onChange(updated);
      // Reset group position to maintain relative positioning
      node.x(0);
      node.y(0);
    }
  };

  const handleTransformStart = () => {
    isTransformingRef.current = true;
  };

  const handleTransformEnd = (id, e) => {
    isTransformingRef.current = false;

    const node = e.target;
    const shape = rectData.find((r) => r.id === id);
    if (!shape) return;

    // Handle rectangles
    if (shape.type === "rectangle" || !shape.type) {
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      const newWidth = Math.max(10, shape.width * scaleX);
      const newHeight = Math.max(10, shape.height * scaleY);

      // Reset scale
      node.scaleX(1);
      node.scaleY(1);

      const updated = rectData.map((r) =>
        r.id === id ? { ...r, x: node.x(), y: node.y(), width: newWidth, height: newHeight } : r
      );
      onChange && onChange(updated);
    } 
    // Handle polygons and polylines
    else if (shape.type === "polygon" || shape.type === "polyline") {
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      const dx = node.x(); // Offset from original Group position
      const dy = node.y();

      // Get original points
      const points = shape.points || [];
      if (points.length === 0) return;

      // Find original bounding box (before transform)
      let origMinX = points[0];
      let origMinY = points[1];
      let origMaxX = points[0];
      let origMaxY = points[1];
      for (let i = 0; i < points.length; i += 2) {
        origMinX = Math.min(origMinX, points[i]);
        origMaxX = Math.max(origMaxX, points[i]);
        origMinY = Math.min(origMinY, points[i + 1]);
        origMaxY = Math.max(origMaxY, points[i + 1]);
      }
      const origCenterX = (origMinX + origMaxX) / 2;
      const origCenterY = (origMinY + origMaxY) / 2;

      // New Group position (original minX/minY + drag offset)
      const newMinX = origMinX + dx;
      const newMinY = origMinY + dy;

      // Apply transformation: scale around center, then translate
      const updatedPoints = [];
      for (let i = 0; i < points.length; i += 2) {
        const px = points[i];
        const py = points[i + 1];
        // Scale relative to original center, then adjust for new position
        const scaledX = (px - origCenterX) * scaleX + origCenterX;
        const scaledY = (py - origCenterY) * scaleY + origCenterY;
        // Translate by the drag offset
        updatedPoints.push(scaledX + dx, scaledY + dy);
      }

      // Reset node transform
      node.scaleX(1);
      node.scaleY(1);
      node.x(0);
      node.y(0);

      const updated = rectData.map((r) =>
        r.id === id ? { ...r, points: updatedPoints } : r
      );
      onChange && onChange(updated);
    }
  };

  return (
    <Stage
      width={width}
      height={height}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDblClick={handleDoubleClick}
      style={{
        cursor:
          mode === "cursor" 
            ? "default" 
            : drawEnabled && (mode === "rectangle" || mode === "polygon" || mode === "polyline")
            ? "crosshair" 
            : "default",
      }}
    >
      <Layer ref={layerRef}>
        {image && <Image image={image} width={width} height={height} />}

        {rectData.map((shape, idx) => {
          // Render rectangles
          if (shape.type === "rectangle" || !shape.type) {
            return (
              <Group
                key={shape.id}
                id={`rect-${shape.id}`}
                draggable={mode !== "cursor"}
                x={shape.x}
                y={shape.y}
                width={shape.width}
                height={shape.height}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragMove={(e) => handleDragMove(shape.id, e)}
                onTransformStart={handleTransformStart}
                onTransformEnd={(e) => handleTransformEnd(shape.id, e)}
              >
                <Rect
                  width={shape.width}
                  height={shape.height}
                  fill={selectedId === shape.id ? "rgba(166,124,0,0.12)" : "rgba(166,124,0,0.06)"}
                  stroke={selectedId === shape.id ? "#ab7a00" : (shape.color || boxColor)}
                  strokeWidth={2}
                  cornerRadius={4}
                  name="drawnRect"
                />
                <Text text={`#${idx + 1}`} x={6} y={shape.height - 18} fontSize={13} fill="#d4a800" />
              </Group>
            );
          }
          
          // Render polygons and polylines
          if (shape.type === "polygon" || shape.type === "polyline") {
            const points = shape.points || [];
            if (points.length === 0) return null;
            
            const isSelected = selectedId === shape.id;
            
            // Calculate bounding box for transformer
            let minX = points[0];
            let minY = points[1];
            let maxX = points[0];
            let maxY = points[1];
            for (let i = 0; i < points.length; i += 2) {
              minX = Math.min(minX, points[i]);
              maxX = Math.max(maxX, points[i]);
              minY = Math.min(minY, points[i + 1]);
              maxY = Math.max(maxY, points[i + 1]);
            }
            const width = Math.max(1, maxX - minX);
            const height = Math.max(1, maxY - minY);
            
            // Convert absolute points to relative points for rendering in Group
            const relativePoints = [];
            for (let i = 0; i < points.length; i += 2) {
              relativePoints.push(points[i] - minX, points[i + 1] - minY);
            }
            
            return (
              <Group
                key={shape.id}
                id={`poly-${shape.id}`}
                x={minX}
                y={minY}
                width={width}
                height={height}
                draggable={mode !== "cursor"}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragMove={(e) => handleDragMove(shape.id, e)}
                onTransformStart={handleTransformStart}
                onTransformEnd={(e) => handleTransformEnd(shape.id, e)}
              >
                {shape.type === "polygon" ? (
                  <Shape
                    sceneFunc={(context, shapeNode) => {
                      context.beginPath();
                      context.moveTo(relativePoints[0], relativePoints[1]);
                      for (let i = 2; i < relativePoints.length; i += 2) {
                        context.lineTo(relativePoints[i], relativePoints[i + 1]);
                      }
                      context.closePath();
                      context.fillStrokeShape(shapeNode);
                    }}
                    fill={isSelected ? "rgba(166,124,0,0.12)" : "rgba(166,124,0,0.06)"}
                    stroke={isSelected ? "#ab7a00" : (shape.color || boxColor)}
                    strokeWidth={2}
                  />
                ) : (
                  <Line
                    points={relativePoints}
                    fill={isSelected ? "rgba(166,124,0,0.12)" : "rgba(166,124,0,0.06)"}
                    stroke={isSelected ? "#ab7a00" : (shape.color || boxColor)}
                    strokeWidth={2}
                    closed={false}
                  />
                )}
                {/* Invisible rect for transformer to attach to - provides bounding box */}
                <Rect
                  width={width}
                  height={height}
                  fill="transparent"
                  stroke="transparent"
                  listening={false}
                />
                {relativePoints.length > 0 && (
                  <Text 
                    text={`#${idx + 1}`} 
                    x={relativePoints[0] + 6} 
                    y={relativePoints[1] - 18} 
                    fontSize={13} 
                    fill="#d4a800" 
                  />
                )}
              </Group>
            );
          }
          return null;
        })}

        {/* TRANSFORMER */}
        <Transformer
          ref={trRef}
          rotateEnabled={false}
          anchorSize={8}
          padding={4}
          borderStroke="#ab7a00"
          borderStrokeWidth={2}
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
            "middle-right",
          ]}
        />

        {/* PREVIEW WHILE DRAWING RECTANGLE */}
        {newRect && (
          <Rect
            x={newRect.width >= 0 ? newRect.x : newRect.x + newRect.width}
            y={newRect.height >= 0 ? newRect.y : newRect.y + newRect.height}
            width={Math.abs(newRect.width)}
            height={Math.abs(newRect.height)}
            stroke={boxColor}
            strokeWidth={2}
            dash={[6, 4]}
            fill="rgba(74, 163, 255, 0.1)"
          />
        )}

        {/* PREVIEW WHILE DRAWING POLYGON/POLYLINE */}
        {isDrawingPolygon && polygonPoints.length > 0 && (
          <>
            {polygonPoints.length > 1 && (
              <Line
                points={polygonPoints.flatMap(p => [p.x, p.y])}
                stroke={boxColor}
                strokeWidth={2}
                dash={[6, 4]}
                closed={mode === "polygon"}
              />
            )}
            {polygonPoints.map((point, idx) => (
              <Group key={idx} x={point.x} y={point.y}>
                <Rect
                  x={-4}
                  y={-4}
                  width={8}
                  height={8}
                  fill={boxColor}
                  stroke={boxColor}
                  strokeWidth={1}
                />
                {idx === 0 && polygonPoints.length >= 2 && (
                  <Text
                    text={mode === "polygon" ? "Double-click to close" : "Double-click to finish"}
                    x={10}
                    y={-6}
                    fontSize={10}
                    fill={boxColor}
                  />
                )}
              </Group>
            ))}
          </>
        )}
      </Layer>
    </Stage>
  );
}
