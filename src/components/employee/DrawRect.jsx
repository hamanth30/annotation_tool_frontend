import React, { useRef, useState, useEffect, useImperativeHandle, forwardRef } from "react";
import {
  Stage,
  Layer,
  Rect,
  Image,
  Transformer,
  Text,
  Group,
  Line,
  Shape,
  Circle,
} from "react-konva";
import Konva from "konva";

/**
 * Helpers for polygon / polyline editing
 */

// Convert stored points (may have duplicate closing point for polygon) to "logical" vertices
const getLogicalPoints = (shapeType, points = []) => {
  const pts = Array.isArray(points) ? points : [];
  if (pts.length < 4) return pts.slice();

  // If polygon and last == first, drop the closing duplicate; work with unique vertices
  if (shapeType === "polygon" && pts.length >= 6) {
    const x0 = pts[0];
    const y0 = pts[1];
    const xLast = pts[pts.length - 2];
    const yLast = pts[pts.length - 1];
    if (x0 === xLast && y0 === yLast) {
      return pts.slice(0, pts.length - 2);
    }
  }
  return pts.slice();
};

// Convert logical vertices back to stored points (polygon closes shape, polyline stays open)
const buildStoredPoints = (shapeType, logicalPoints = []) => {
  const pts = Array.isArray(logicalPoints) ? logicalPoints.slice() : [];
  if (shapeType === "polygon" && pts.length >= 6) {
    // close polygon by repeating first vertex
    const x0 = pts[0];
    const y0 = pts[1];
    const xLast = pts[pts.length - 2];
    const yLast = pts[pts.length - 1];
    // append only if not already closed
    if (x0 !== xLast || y0 !== yLast) {
      pts.push(x0, y0);
    }
  }
  return pts;
};

// Distance from a point (px,py) to a line segment (x1,y1)-(x2,y2)
const distancePointToSegment = (px, py, x1, y1, x2, y2) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (dx === 0 && dy === 0) {
    // segment is a point
    const ddx = px - x1;
    const ddy = py - y1;
    return Math.sqrt(ddx * ddx + ddy * ddy);
  }
  const t = ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy);
  const tt = Math.max(0, Math.min(1, t));
  const projX = x1 + tt * dx;
  const projY = y1 + tt * dy;
  const ddx = px - projX;
  const ddy = py - projY;
  return Math.sqrt(ddx * ddx + ddy * ddy);
};

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
 *  - brightness: number from -1 to 1 for brightness adjustment
 */
const DrawRect = forwardRef(function DrawRect({
  width,
  height,
  imageUrl,
  rectData = [],
  onChange,
  drawEnabled = true,
  mode = "rectangle",
  boxColor = "#d4a800",
  brightness = 0,
}, ref) {
  const [image, setImage] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 });
  const [newRect, setNewRect] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [polygonPoints, setPolygonPoints] = useState([]);
  const [isDrawingPolygon, setIsDrawingPolygon] = useState(false);

  // zoom / pan
  const [scale, setScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });

  const trRef = useRef();
  const layerRef = useRef();
  const isDraggingRef = useRef(false);
  const isTransformingRef = useRef(false);
  const isPanningRef = useRef(false);
  const lastPanPosRef = useRef({ x: 0, y: 0 });
  const spacePressedRef = useRef(false);

  const imageRef = useRef(null);
  const stageRef = useRef(null);

  // Helper function to convert pointer position from stage coordinates to actual canvas coordinates
  const getActualPointerPosition = (stage) => {
    const pointer = stage.getPointerPosition();
    if (!pointer) return null;
    return {
      x: (pointer.x - stagePos.x) / scale,
      y: (pointer.y - stagePos.y) / scale,
    };
  };

  // Expose fitToScreen function to parent component
  useImperativeHandle(ref, () => ({
    fitToScreen: () => {
      setScale(1);
      setStagePos({ x: 0, y: 0 });
    },
  }));

  // handle global Space key for panning
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        spacePressedRef.current = true;
      }
    };
    const handleKeyUp = (e) => {
      if (e.code === "Space") {
        spacePressedRef.current = false;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (!imageUrl) {
      setImage(null);
      setImageDimensions({ width: 0, height: 0 });
      setImageOffset({ x: 0, y: 0 });
      return;
    }
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
      setImage(img);
      const imgWidth = img.naturalWidth || img.width;
      const imgHeight = img.naturalHeight || img.height;
      setImageDimensions({ width: imgWidth, height: imgHeight });
      
      const offsetX = Math.max(0, (width - imgWidth) / 2);
      const offsetY = Math.max(0, (height - imgHeight) / 2);
      setImageOffset({ x: offsetX, y: offsetY });
    };
  }, [imageUrl, width, height]);

  // Update brightness filter when brightness changes
  useEffect(() => {
    if (imageRef.current) {
      if (brightness !== 0) {
      imageRef.current.cache();
      } else {
        imageRef.current.clearCache();
      }
      imageRef.current.getLayer()?.batchDraw();
    }
  }, [brightness]);

  // attach transformer to selected shape
  useEffect(() => {
    if (trRef.current) {
      const stage = trRef.current.getStage();
      const selectedNode = selectedId 
        ? stage.findOne(`#rect-${selectedId}`) || stage.findOne(`#poly-${selectedId}`)
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
    const stage = e.target.getStage();
    const evt = e.evt;

    // PAN: middle mouse OR Space + left mouse
    if (
      evt.button === 1 ||
      (evt.button === 0 && spacePressedRef.current)
    ) {
      isPanningRef.current = true;
      lastPanPosRef.current = { x: evt.clientX, y: evt.clientY };
      return;
    }

    // Don't start drawing if currently dragging or transforming
    if (isDraggingRef.current || isTransformingRef.current) {
      return;
    }

    const clickedOnEmpty =
      e.target === stage || e.target.getClassName() === "Image";

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
        const pos = getActualPointerPosition(stage);
        if (!pos) return;
        isDrawing.current = true;
        startPos.current = pos;
        setNewRect({ x: pos.x, y: pos.y, width: 0, height: 0 });
      }
      // Handle polygon/polyline drawing
      else if (drawEnabled && (mode === "polygon" || mode === "polyline")) {
        const pos = getActualPointerPosition(stage);
        if (!pos) return;
        if (!isDrawingPolygon) {
          setIsDrawingPolygon(true);
          setPolygonPoints([pos]);
        } else {
          // Check if clicking near the first point to close polygon
          if (polygonPoints.length >= 2 && mode === "polygon") {
            const firstPoint = polygonPoints[0];
            const distance = Math.sqrt(
              Math.pow(pos.x - firstPoint.x, 2) +
                Math.pow(pos.y - firstPoint.y, 2)
            );
            if (distance < 10 / scale) { // Adjust threshold for zoom level
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
    const evt = e.evt;

    // PAN
    if (isPanningRef.current) {
      const dx = evt.clientX - lastPanPosRef.current.x;
      const dy = evt.clientY - lastPanPosRef.current.y;
      setStagePos((prev) => ({
        x: prev.x + dx,
        y: prev.y + dy,
      }));
      lastPanPosRef.current = { x: evt.clientX, y: evt.clientY };
      return;
    }

    if (!isDrawing.current || !newRect || isDraggingRef.current) return;
    const stage = e.target.getStage();
    const pos = getActualPointerPosition(stage);
    if (!pos) return;

    setNewRect({
      x: startPos.current.x,
      y: startPos.current.y,
      width: pos.x - startPos.current.x,
      height: pos.y - startPos.current.y,
    });
  };

  const handleMouseUp = () => {
    // stop pan
    isPanningRef.current = false;

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
          classes: {
            className: "",
            attributeName: "",
            attributeValue: "",
          },
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
    const basePoints = polygonPoints.flatMap((p) => [p.x, p.y]);
    let points = basePoints;
    
    // For polygon, we can store with closing point duplicated,
    // buildStoredPoints will ensure closure later as well.
    if (mode === "polygon" && polygonPoints.length >= 3) {
      const firstPoint = polygonPoints[0];
      points = [...basePoints, firstPoint.x, firstPoint.y];
    }

    const updated = [
      ...rectData,
      {
        id,
        type: mode === "polygon" ? "polygon" : "polyline",
        points: points,
        classes: {
          className: "",
          attributeName: "",
          attributeValue: "",
        },
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
      const dx = node.x();
      const dy = node.y();
      const updatedPoints = (shape.points || []).map((p, i) => 
        i % 2 === 0 ? p + dx : p + dy
      );
      const updated = rectData.map((r) =>
        r.id === id ? { ...r, points: updatedPoints } : r
      );
      onChange && onChange(updated);
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

      node.scaleX(1);
      node.scaleY(1);

      const updated = rectData.map((r) =>
        r.id === id
          ? { ...r, x: node.x(), y: node.y(), width: newWidth, height: newHeight }
          : r
      );
      onChange && onChange(updated);
    } 
    // Handle polygons and polylines (scale whole shape)
    else if (shape.type === "polygon" || shape.type === "polyline") {
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      const dx = node.x();
      const dy = node.y();

      const points = shape.points || [];
      if (points.length === 0) return;

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

      const updatedPoints = [];
      for (let i = 0; i < points.length; i += 2) {
        const px = points[i];
        const py = points[i + 1];
        const scaledX = (px - origCenterX) * scaleX + origCenterX;
        const scaledY = (py - origCenterY) * scaleY + origCenterY;
        updatedPoints.push(scaledX + dx, scaledY + dy);
      }

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

  // ---------------- ZOOM HANDLER ----------------
  const handleWheel = (e) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    const oldScale = scale;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const scaleBy = 1.05;
    const newScale =
      e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

    // Limit zoom
    const clampedScale = Math.max(0.2, Math.min(5, newScale));

    const mousePointTo = {
      x: (pointer.x - stagePos.x) / oldScale,
      y: (pointer.y - stagePos.y) / oldScale,
    };

    const newPos = {
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    };

    setScale(clampedScale);
    setStagePos(newPos);
  };

  // ---------------- POINT EDITING HELPERS ----------------

  const updateShapePoints = (shapeId, shapeType, logicalPoints) => {
    const stored = buildStoredPoints(shapeType, logicalPoints);
    const updated = rectData.map((r) =>
      r.id === shapeId ? { ...r, points: stored } : r
    );
    onChange && onChange(updated);
  };

  return (
    <Stage
      ref={stageRef}
      width={width}
      height={height}
      x={stagePos.x}
      y={stagePos.y}
      scaleX={scale}
      scaleY={scale}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDblClick={handleDoubleClick}
      onWheel={handleWheel}
      style={{
        cursor:
          mode === "cursor" 
            ? "default" 
            : drawEnabled &&
              (mode === "rectangle" || mode === "polygon" || mode === "polyline")
            ? "crosshair" 
            : "default",
      }}
    >
      <Layer ref={layerRef}>
        {/* Black background fill */}
        <Rect x={0} y={0} width={width} height={height} fill="#000000" />
        
        {/* Image at native size, centered */}
        {image && imageDimensions.width > 0 && imageDimensions.height > 0 && (
          <Image 
            ref={imageRef}
            image={image} 
            x={imageOffset.x}
            y={imageOffset.y}
            width={imageDimensions.width}
            height={imageDimensions.height}
            filters={brightness !== 0 ? [Konva.Filters.Brightness] : []}
            brightness={brightness !== 0 ? brightness + 1 : 1}
          />
        )}

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
                  fill={
                    selectedId === shape.id
                      ? "rgba(166,124,0,0.12)"
                      : "rgba(166,124,0,0.06)"
                  }
                  stroke={
                    selectedId === shape.id
                      ? "#ab7a00"
                      : shape.color || boxColor
                  }
                  strokeWidth={2}
                  cornerRadius={4}
                  name="drawnRect"
                />
                <Text
                  text={`#${idx + 1}`}
                  x={6}
                  y={shape.height - 18}
                  fontSize={13}
                  fill="#d4a800"
                />
              </Group>
            );
          }
          
          // Render polygons and polylines
          if (shape.type === "polygon" || shape.type === "polyline") {
            const rawPoints = shape.points || [];
            const logicalPoints = getLogicalPoints(shape.type, rawPoints);
            if (logicalPoints.length === 0) return null;
            
            const isSelected = selectedId === shape.id;
            
            // Calculate bounding box for transformer using logical vertices
            let minX = logicalPoints[0];
            let minY = logicalPoints[1];
            let maxX = logicalPoints[0];
            let maxY = logicalPoints[1];
            for (let i = 0; i < logicalPoints.length; i += 2) {
              minX = Math.min(minX, logicalPoints[i]);
              maxX = Math.max(maxX, logicalPoints[i]);
              minY = Math.min(minY, logicalPoints[i + 1]);
              maxY = Math.max(maxY, logicalPoints[i + 1]);
            }
            const widthBox = Math.max(1, maxX - minX);
            const heightBox = Math.max(1, maxY - minY);

            // Convert logical absolute points to relative points for rendering in Group
            const relativePoints = [];
            for (let i = 0; i < logicalPoints.length; i += 2) {
              relativePoints.push(
                logicalPoints[i] - minX,
                logicalPoints[i + 1] - minY
              );
            }
            const vertexCount = logicalPoints.length / 2;

            // Click on shape to (possibly) add point on nearest edge (Option A)
            const handleShapeMouseDown = (e) => {
              // Only left click
              if (e.evt.button !== 0) return;

              // For point editing, we handle it only in cursor mode
              e.cancelBubble = true;
              setSelectedId(shape.id);

              if (mode !== "cursor") return;

              const stage = e.target.getStage();
              const actualPos = getActualPointerPosition(stage);
              if (!actualPos) return;

              const clickX = actualPos.x;
              const clickY = actualPos.y;

              if (vertexCount < 2) return;

              let closestDist = Infinity;
              let insertIndex = -1;

              const isPoly = shape.type === "polygon";
              const lastIdx = vertexCount - 1;
              const segmentCount = isPoly ? vertexCount : vertexCount - 1;

              for (let i = 0; i < segmentCount; i++) {
                const j = i === lastIdx ? 0 : i + 1;
                const x1 = logicalPoints[i * 2];
                const y1 = logicalPoints[i * 2 + 1];
                const x2 = logicalPoints[j * 2];
                const y2 = logicalPoints[j * 2 + 1];
                const dist = distancePointToSegment(
                  clickX,
                  clickY,
                  x1,
                  y1,
                  x2,
                  y2
                );
                if (dist < closestDist) {
                  closestDist = dist;
                  insertIndex = j;
                }
              }

              const threshold = 8 / scale; // Convert screen pixels to canvas pixels
              if (insertIndex === -1 || closestDist > threshold) {
                // Just selection, no point insert
                return;
              }

              const newLogical = [...logicalPoints];
              newLogical.splice(insertIndex * 2, 0, clickX, clickY);
              updateShapePoints(shape.id, shape.type, newLogical);
            };

            // Dragging a single vertex
            const handleVertexDragMove = (vertexIndex, e) => {
              e.cancelBubble = true;
              const stage = e.target.getStage();
              const actualPos = getActualPointerPosition(stage);
              if (!actualPos) return;

              const newLogical = getLogicalPoints(shape.type, shape.points || []);
              if (vertexIndex * 2 + 1 >= newLogical.length) return;

              newLogical[vertexIndex * 2] = actualPos.x;
              newLogical[vertexIndex * 2 + 1] = actualPos.y;

              updateShapePoints(shape.id, shape.type, newLogical);
            };

            // Right-click to remove vertex
            const handleVertexContextMenu = (vertexIndex, e) => {
              e.evt.preventDefault();
              e.cancelBubble = true;

              let newLogical = getLogicalPoints(shape.type, shape.points || []);
              const count = newLogical.length / 2;

              // Don't remove below minimum points
              if (shape.type === "polygon" && count <= 3) return;
              if (shape.type === "polyline" && count <= 2) return;

              newLogical.splice(vertexIndex * 2, 2);
              updateShapePoints(shape.id, shape.type, newLogical);
            };
            
            return (
              <Group
                key={shape.id}
                id={`poly-${shape.id}`}
                x={minX}
                y={minY}
                width={widthBox}
                height={heightBox}
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
                    fill={
                      isSelected
                        ? "rgba(166,124,0,0.12)"
                        : "rgba(166,124,0,0.06)"
                    }
                    stroke={
                      isSelected ? "#ab7a00" : shape.color || boxColor
                    }
                    strokeWidth={2}
                    onMouseDown={handleShapeMouseDown}
                  />
                ) : (
                  <Line
                    points={relativePoints}
                    fill={
                      isSelected
                        ? "rgba(166,124,0,0.12)"
                        : "rgba(166,124,0,0.06)"
                    }
                    stroke={
                      isSelected ? "#ab7a00" : shape.color || boxColor
                    }
                    strokeWidth={2}
                    closed={false}
                    onMouseDown={handleShapeMouseDown}
                  />
                )}

                {/* Invisible rect for transformer to attach to - provides bounding box */}
                <Rect
                  width={widthBox}
                  height={heightBox}
                  fill="transparent"
                  stroke="transparent"
                  listening={false}
                />

                {/* Label */}
                {relativePoints.length > 0 && (
                  <Text 
                    text={`#${idx + 1}`} 
                    x={relativePoints[0] + 6} 
                    y={relativePoints[1] - 18} 
                    fontSize={13} 
                    fill="#d4a800" 
                  />
                )}

                {/* Vertex handles: only in cursor mode & when selected */}
                {isSelected && mode === "cursor" && vertexCount > 0 && (
                  <>
                    {Array.from({ length: vertexCount }).map((_, vIndex) => {
                      const vx = relativePoints[vIndex * 2];
                      const vy = relativePoints[vIndex * 2 + 1];
                      return (
                        <Circle
                          key={vIndex}
                          x={vx}
                          y={vy}
                          radius={5}
                          fill="#00e1ff"
                          stroke="#000"
                          strokeWidth={1}
                          draggable
                          onDragMove={(e) =>
                            handleVertexDragMove(vIndex, e)
                          }
                          onMouseDown={(e) => {
                            e.cancelBubble = true;
                            setSelectedId(shape.id);
                          }}
                          onContextMenu={(e) =>
                            handleVertexContextMenu(vIndex, e)
                          }
                        />
                      );
                    })}
                  </>
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
          padding={0}
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
                points={polygonPoints.flatMap((p) => [p.x, p.y])}
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
                    text={
                      mode === "polygon"
                        ? "Double-click to close"
                        : "Double-click to finish"
                    }
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
});

export default DrawRect;
