




// import React, { useRef, useState, useEffect } from "react";
// import { Stage, Layer, Rect, Image, Transformer, Text, Group } from "react-konva";

// export default function DrawRect({ width, height, imageUrl, rectData = [], onChange, drawEnabled = true, mode = "rectangle", boxColor = "#d4a800" }) {
//   const [image, setImage] = useState(null);
//   const [newRect, setNewRect] = useState(null);
//   const [selectedId, setSelectedId] = useState(null);
//   const trRef = useRef();
//   const layerRef = useRef();
//   const isDraggingRef = useRef(false);
//   const isTransformingRef = useRef(false);

//   useEffect(() => {
//     if (!imageUrl) return setImage(null);
//     const img = new window.Image();
//     img.crossOrigin = "anonymous";
//     img.src = imageUrl;
//     img.onload = () => setImage(img);
//   }, [imageUrl]);

//   // attach transformer to selected shape
//   useEffect(() => {
//     if (trRef.current) {
//       const stage = trRef.current.getStage();
//       const selectedNode = selectedId ? stage.findOne(`#rect-${selectedId}`) : null;
//       trRef.current.nodes(selectedNode ? [selectedNode] : []);
//       trRef.current.getLayer() && trRef.current.getLayer().batchDraw();
//     }
//   }, [selectedId, rectData]);

//   // ---------------- DRAW NEW RECT ----------------
//   const isDrawing = useRef(false);
//   const startPos = useRef({ x: 0, y: 0 });

//   const handleMouseDown = (e) => {
//     // Don't start drawing if currently dragging or transforming
//     if (isDraggingRef.current || isTransformingRef.current) {
//       return;
//     }

//     const stage = e.target.getStage();
//     const clickedOnEmpty = e.target === stage || e.target.getClassName() === 'Image';
    
//     // Check if clicked on existing rect or its children
//     let target = e.target;
//     while (target) {
//       const targetId = target.attrs?.id || "";
//       if (targetId.startsWith("rect-")) {
//         const id = targetId.replace("rect-", "");
//         setSelectedId(id);
//         return;
//       }
//       target = target.parent;
//     }

//     // Deselect if clicking on empty space
//     if (clickedOnEmpty) {
//       setSelectedId(null);
      
//       // Only start drawing if draw mode is enabled and mode is rectangle
//       if (drawEnabled && mode === "rectangle") {
//         const pos = stage.getPointerPosition();
//         isDrawing.current = true;
//         startPos.current = pos;
//         setNewRect({ x: pos.x, y: pos.y, width: 0, height: 0 });
//       }
//     }
//   };

//   const handleMouseMove = (e) => {
//     if (!isDrawing.current || !newRect || isDraggingRef.current) return;
//     const pos = e.target.getStage().getPointerPosition();

//     setNewRect({
//       x: startPos.current.x,
//       y: startPos.current.y,
//       width: pos.x - startPos.current.x,
//       height: pos.y - startPos.current.y,
//     });
//   };

//   const handleMouseUp = () => {
//     if (!isDrawing.current || !newRect) {
//       isDrawing.current = false;
//       return;
//     }

//     const raw = newRect;
//     const absWidth = Math.abs(raw.width);
//     const absHeight = Math.abs(raw.height);
//     const normX = raw.width >= 0 ? raw.x : raw.x + raw.width;
//     const normY = raw.height >= 0 ? raw.y : raw.y + raw.height;

//     if (absWidth > 8 && absHeight > 8) {
//       const id = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
//       const updated = [
//         ...rectData,
//         { id, x: normX, y: normY, width: absWidth, height: absHeight, classes: { className: "", attributeName: "", attributeValue: "" }, color: boxColor }
//       ];
//       onChange && onChange(updated);
//     }

//     isDrawing.current = false;
//     setNewRect(null);
//   };

//   // ---------------- DRAG / RESIZE HANDLERS ----------------
//   const handleDragStart = () => {
//     isDraggingRef.current = true;
//   };

//   const handleDragEnd = () => {
//     isDraggingRef.current = false;
//   };

//   const handleDragMove = (id, e) => {
//     const node = e.target;
//     const updated = rectData.map(r => 
//       r.id === id 
//         ? { ...r, x: node.x(), y: node.y() } 
//         : r
//     );
//     onChange && onChange(updated);
//   };

//   const handleTransformStart = () => {
//     isTransformingRef.current = true;
//   };

//   const handleTransformEnd = (id, e) => {
//     isTransformingRef.current = false;
    
//     const node = e.target;
//     const scaleX = node.scaleX();
//     const scaleY = node.scaleY();

//     // Get the current rect data to preserve width/height
//     const currentRect = rectData.find(r => r.id === id);
//     if (!currentRect) return;

//     // Use the stored width/height, not node.width() which might be incorrect after drag
//     const newWidth = Math.max(10, currentRect.width * scaleX);
//     const newHeight = Math.max(10, currentRect.height * scaleY);

//     // Reset scale
//     node.scaleX(1);
//     node.scaleY(1);

//     const updated = rectData.map(r => 
//       r.id === id 
//         ? { ...r, x: node.x(), y: node.y(), width: newWidth, height: newHeight } 
//         : r
//     );
//     onChange && onChange(updated);
//   };

//   return (
//     <Stage
//       width={width}
//       height={height}
//       onMouseDown={handleMouseDown}
//       onMouseMove={handleMouseMove}
//       onMouseUp={handleMouseUp}
//       style={{ cursor: mode === "cursor" ? "default" : (drawEnabled && mode === "rectangle" ? "crosshair" : "default") }}
//     >
//       <Layer ref={layerRef}>
//         {image && <Image image={image} width={width} height={height} />}

//         {rectData.map((rect, idx) => (
//           <Group
//             key={rect.id}
//             id={`rect-${rect.id}`}
//             draggable={mode !== "cursor"}
//             x={rect.x}
//             y={rect.y}
//             width={rect.width}
//             height={rect.height}
//             onDragStart={handleDragStart}
//             onDragEnd={handleDragEnd}
//             onDragMove={(e) => handleDragMove(rect.id, e)}
//             onTransformStart={handleTransformStart}
//             onTransformEnd={(e) => handleTransformEnd(rect.id, e)}
//           >
//             <Rect
//               width={rect.width}
//               height={rect.height}
//               fill={selectedId === rect.id ? "rgba(166,124,0,0.12)" : "rgba(166,124,0,0.06)"}
//               stroke={selectedId === rect.id ? "#ab7a00" : (rect.color || boxColor)}
//               strokeWidth={2}
//               cornerRadius={4}
//               name="drawnRect"
//             />

//             {/* BOX NUMBER LABEL */}
//             <Text
//               text={`#${idx + 1}`}
//               x={6}
//               y={rect.height - 18}
//               fontSize={13}
//               fill="#d4a800"
//             />
//           </Group>
//         ))}

//         {/* TRANSFORMER */}
//         <Transformer
//           ref={trRef}
//           rotateEnabled={false}
//           anchorSize={8}
//           padding={4}
//           borderStroke="#ab7a00"
//           borderStrokeWidth={2}
//           anchorStroke="#ab7a00"
//           anchorFill="#1f1a09"
//           anchorCornerRadius={3}
//           enabledAnchors={[
//             "top-left",
//             "top-right",
//             "bottom-left",
//             "bottom-right",
//             "top-center",
//             "bottom-center",
//             "middle-left",
//             "middle-right"
//           ]}
//         />

//         {/* PREVIEW WHILE DRAWING */}
//         {newRect && (
//           <Rect
//             x={newRect.width >= 0 ? newRect.x : newRect.x + newRect.width}
//             y={newRect.height >= 0 ? newRect.y : newRect.y + newRect.height}
//             width={Math.abs(newRect.width)}
//             height={Math.abs(newRect.height)}
//             stroke={boxColor}
//             strokeWidth={2}
//             dash={[6, 4]}
//             fill="rgba(74, 163, 255, 0.1)"
//           />
//         )}
//       </Layer>
//     </Stage>
//   );
// }


















import React, { useRef, useState, useEffect } from "react";
import { Stage, Layer, Rect, Image, Transformer, Text, Group } from "react-konva";

/**
 * DrawRect
 * props:
 *  - width, height
 *  - imageUrl
 *  - rectData (array of rects)
 *  - onChange(updatedRects)
 *  - drawEnabled (boolean)
 *  - mode: "cursor" | "rectangle" | "polygon" (polygon NOT IMPLEMENTED)
 *  - boxColor: hex color string for new boxes
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
      const selectedNode = selectedId ? stage.findOne(`#rect-${selectedId}`) : null;
      trRef.current.nodes(selectedNode ? [selectedNode] : []);
      trRef.current.getLayer() && trRef.current.getLayer().batchDraw();
    }
  }, [selectedId, rectData]);

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

    // Check if clicked on existing rect or its children
    let target = e.target;
    while (target) {
      const targetId = target.attrs?.id || "";
      if (targetId.startsWith("rect-")) {
        const id = targetId.replace("rect-", "");
        setSelectedId(id);
        return;
      }
      target = target.parent;
    }

    // Deselect if clicking on empty space
    if (clickedOnEmpty) {
      setSelectedId(null);

      // Only start drawing if draw mode is enabled and mode is rectangle
      if (drawEnabled && mode === "rectangle") {
        const pos = stage.getPointerPosition();
        isDrawing.current = true;
        startPos.current = pos;
        setNewRect({ x: pos.x, y: pos.y, width: 0, height: 0 });
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

  // ---------------- DRAG / RESIZE HANDLERS ----------------
  const handleDragStart = () => {
    isDraggingRef.current = true;
  };

  const handleDragEnd = () => {
    isDraggingRef.current = false;
  };

  const handleDragMove = (id, e) => {
    const node = e.target;
    const updated = rectData.map((r) =>
      r.id === id ? { ...r, x: node.x(), y: node.y() } : r
    );
    onChange && onChange(updated);
  };

  const handleTransformStart = () => {
    isTransformingRef.current = true;
  };

  const handleTransformEnd = (id, e) => {
    isTransformingRef.current = false;

    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Get the current rect data to preserve width/height
    const currentRect = rectData.find((r) => r.id === id);
    if (!currentRect) return;

    const newWidth = Math.max(10, currentRect.width * scaleX);
    const newHeight = Math.max(10, currentRect.height * scaleY);

    // Reset scale
    node.scaleX(1);
    node.scaleY(1);

    const updated = rectData.map((r) =>
      r.id === id ? { ...r, x: node.x(), y: node.y(), width: newWidth, height: newHeight } : r
    );
    onChange && onChange(updated);
  };

  return (
    <Stage
      width={width}
      height={height}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{
        cursor:
          mode === "cursor" ? "default" : drawEnabled && mode === "rectangle" ? "crosshair" : "default",
      }}
    >
      <Layer ref={layerRef}>
        {image && <Image image={image} width={width} height={height} />}

        {rectData.map((rect, idx) => (
          <Group
            key={rect.id}
            id={`rect-${rect.id}`}
            draggable={mode !== "cursor"}
            x={rect.x}
            y={rect.y}
            width={rect.width}
            height={rect.height}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragMove={(e) => handleDragMove(rect.id, e)}
            onTransformStart={handleTransformStart}
            onTransformEnd={(e) => handleTransformEnd(rect.id, e)}
          >
            <Rect
              width={rect.width}
              height={rect.height}
              fill={selectedId === rect.id ? "rgba(166,124,0,0.12)" : "rgba(166,124,0,0.06)"}
              stroke={selectedId === rect.id ? "#ab7a00" : (rect.color || boxColor)}
              strokeWidth={2}
              cornerRadius={4}
              name="drawnRect"
            />

            {/* BOX NUMBER LABEL */}
            <Text text={`#${idx + 1}`} x={6} y={rect.height - 18} fontSize={13} fill="#d4a800" />
          </Group>
        ))}

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

        {/* PREVIEW WHILE DRAWING */}
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
      </Layer>
    </Stage>
  );
}
