"use client";

import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import type { PointerEvent } from "react";

import { distance } from "@/features/quotes/lib/geometry";
import {
  quoteStoreSelectors,
  useQuoteStore,
} from "@/features/quotes/store/quote-store";

const CLOSURE_THRESHOLD_PX = 16;
const HIT_VERTEX_PX = 10;
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function pointInPolygon(p: { x: number; y: number }, poly: { x: number; y: number }[]) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x,
      yi = poly[i].y,
      xj = poly[j].x,
      yj = poly[j].y;
    const intersect = yi > p.y !== yj > p.y && p.x < ((xj - xi) * (p.y - yi)) / (yj - yi + 1e-9) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function angleSnap(rad: number) {
  const set = [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4, Math.PI, (5 * Math.PI) / 4, (3 * Math.PI) / 2, (7 * Math.PI) / 4];
  let best = set[0];
  let dmin = Infinity;
  for (const t of set) {
    const d = Math.abs(((rad - t + Math.PI * 2) % (Math.PI * 2)));
    if (d < dmin) {
      dmin = d;
      best = t;
    }
  }
  return best;
}

function snapFrom(base: { x: number; y: number }, to: { x: number; y: number }, mode: "off" | "90" | "90_45") {
  if (mode === "off") return to;
  const dx = to.x - base.x;
  const dy = to.y - base.y;
  const len = Math.hypot(dx, dy) || 1;
  let ang = Math.atan2(dy, dx);
  if (mode === "90_45") ang = angleSnap(ang);
  if (mode === "90") {
    // snap to 0/90/180/270 only
    const set = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
    let best = set[0];
    let dmin = Infinity;
    for (const t of set) {
      const d = Math.abs(((ang - t + Math.PI * 2) % (Math.PI * 2)));
      if (d < dmin) {
        dmin = d;
        best = t;
      }
    }
    ang = best;
  }
  return { x: base.x + Math.cos(ang) * len, y: base.y + Math.sin(ang) * len };
}

function Toolbar() {
  const activeShapeId = useQuoteStore(quoteStoreSelectors.activeShapeId);
  const currentTool = useQuoteStore(quoteStoreSelectors.currentTool);
  const selection = useQuoteStore(quoteStoreSelectors.selection);
  const shapeOrder = useQuoteStore(quoteStoreSelectors.shapeOrder);
  const {
    startNewShape,
    closeActiveShape,
    undoLastPoint,
    setTool,
    groupSelectedShapes,
    ungroupSelectedShapes,
    deleteSelectedShapes,
    lockSelectedShapes,
    clearAllShapes,
  } = useQuoteStore(quoteStoreSelectors.actions);

  const toolButtonClass = (isActive: boolean) =>
    [
      "rounded-full px-3 py-2 font-medium transition",
      isActive
        ? "bg-sky-500/90 text-white shadow"
        : "border border-white/10 text-white hover:border-white/40 hover:bg-white/10",
    ].join(" ");

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-full border border-white/10 bg-slate-950/80 px-4 py-2 text-sm text-slate-200 shadow-lg">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setTool("select")}
          className={toolButtonClass(currentTool.mode === "select")}
        >
          Select (V)
        </button>
        <button
          type="button"
          onClick={() => setTool("polyline")}
          className={toolButtonClass(currentTool.mode === "polyline")}
        >
          Draw polyline (P)
        </button>
      </div>
      <button
        type="button"
        onClick={() => {
          // Start a new shape by placing the first point at the centre of the canvas
          const canvas = document.getElementById("quote-canvas");
          if (!canvas) return;
          const rect = canvas.getBoundingClientRect();
          startNewShape({
            x: rect.width / 2,
            y: rect.height / 2,
          });
        }}
        className="rounded-full bg-sky-500/90 px-4 py-2 font-semibold text-white transition hover:bg-sky-400"
      >
        + Add shape
      </button>
      <button
        type="button"
        onClick={() => undoLastPoint()}
        className="rounded-full border border-white/10 px-3 py-2 font-medium text-white transition hover:border-white/40 hover:bg-white/10"
      >
        Undo
      </button>
      <button
        type="button"
        disabled={!activeShapeId}
        onClick={() => closeActiveShape()}
        className="rounded-full border border-white/10 px-3 py-2 font-medium text-white transition hover:border-white/40 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Close shape
      </button>
      <div className="flex items-center gap-2 border-l border-white/10 pl-3">
        <button
          type="button"
          onClick={() => groupSelectedShapes()}
          disabled={selection.shapeIds.length < 2}
          className="rounded-full border border-white/10 px-3 py-2 font-medium text-white transition hover:border-white/40 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Group
        </button>
        <button
          type="button"
          onClick={() => ungroupSelectedShapes()}
          disabled={selection.shapeIds.length === 0}
          className="rounded-full border border-white/10 px-3 py-2 font-medium text-white transition hover:border-white/40 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Ungroup
        </button>
        <button
          type="button"
          onClick={() => lockSelectedShapes(true)}
          disabled={selection.shapeIds.length === 0}
          className="rounded-full border border-white/10 px-3 py-2 font-medium text-white transition hover:border-white/40 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Lock
        </button>
        <button
          type="button"
          onClick={() => lockSelectedShapes(false)}
          disabled={selection.shapeIds.length === 0}
          className="rounded-full border border-white/10 px-3 py-2 font-medium text-white transition hover:border-white/40 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Unlock
        </button>
        <button
          type="button"
          onClick={() => deleteSelectedShapes()}
          disabled={selection.shapeIds.length === 0}
          className="rounded-full border border-white/10 px-3 py-2 font-medium text-white transition hover:border-white/40 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Delete
        </button>
      </div>
      <button
        type="button"
        onClick={() => clearAllShapes()}
        disabled={shapeOrder.length === 0}
        className="rounded-full border border-rose-400/60 px-4 py-2 font-semibold text-rose-200 transition hover:border-rose-300 hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Clear all
      </button>
    </div>
  );
}

function QuoteCanvas() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const shapeOrder = useQuoteStore(quoteStoreSelectors.shapeOrder);
  const shapes = useQuoteStore(quoteStoreSelectors.shapes);
  const vertices = useQuoteStore(quoteStoreSelectors.vertices);
  const activeShapeId = useQuoteStore(quoteStoreSelectors.activeShapeId);
  const pendingPoints = useQuoteStore(quoteStoreSelectors.pendingPoints);
  const overlays = useQuoteStore(quoteStoreSelectors.overlays);
  const calibration = useQuoteStore(quoteStoreSelectors.calibration);
  const units = useQuoteStore(quoteStoreSelectors.units);
  const precision = useQuoteStore(quoteStoreSelectors.precision);
  const selection = useQuoteStore(quoteStoreSelectors.selection);
  const currentTool = useQuoteStore(quoteStoreSelectors.currentTool);
  const {
    startNewShape,
    addPointToActiveShape,
    closeActiveShape,
    setHoverPreview,
    moveVertex,
    moveShapePoints,
    selectShape,
    clearSelection,
    setCalibrationFirstPoint,
    finalizeCalibration,
    cancelCalibration,
  } = useQuoteStore(quoteStoreSelectors.actions);

  type Drag =
    | { type: "none" }
    | { type: "vertex"; shapeId: string; vertexIndex: number; anchor?: { x: number; y: number } }
    | { type: "shape"; shapeId: string; start: { x: number; y: number }; original: { x: number; y: number }[] }
    | { type: "shapes"; shapeIds: string[]; start: { x: number; y: number }; originals: Record<string, { points: { x: number; y: number }[] }> }
    | { type: "pan"; start: { x: number; y: number }; panStart: { x: number; y: number } };
  const dragRef = useRef<Drag>({ type: "none" });

  const handlePointerPosition = useCallback(
    (event: PointerEvent<SVGSVGElement>) => {
      const svg = svgRef.current;
      if (!svg) {
        return null;
      }

      const pt = svg.createSVGPoint();
      pt.x = event.clientX;
      pt.y = event.clientY;
      const ctm = svg.getScreenCTM();
      if (!ctm) return null;
      const sp = pt.matrixTransform(ctm.inverse());
      return { x: (sp.x - pan.x) / scale, y: (sp.y - pan.y) / scale };
    },
    [scale, pan.x, pan.y]
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent<SVGSVGElement>) => {
      const point = handlePointerPosition(event);
      if (!point) {
        return;
      }
      const drag = dragRef.current;
      if (drag.type === "pan") {
        const svg = svgRef.current;
        if (!svg) return;
        const pt = svg.createSVGPoint();
        pt.x = event.clientX;
        pt.y = event.clientY;
        const ctm = svg.getScreenCTM();
        if (!ctm) return;
        const sp = pt.matrixTransform(ctm.inverse());
        const dx = sp.x - drag.start.x;
        const dy = sp.y - drag.start.y;
        setPan({ x: drag.panStart.x + dx, y: drag.panStart.y + dy });
        return;
      }

      if (drag.type === "none") {
        setHoverPreview(point);
        return;
      }

      if (drag.type === "vertex") {
        const currentShape = drag.shapeId ? shapes[drag.shapeId] : null;
        if (!currentShape || currentShape.locked) return;
        const pts = currentShape.vertexIds.map((id) => vertices[id]).filter(Boolean) as { x: number; y: number }[];
        const anchor = drag.anchor ?? (pts.length >= 2 ? pts[(drag.vertexIndex - 1 + pts.length) % pts.length] : undefined);
        const next = anchor ? snapFrom(anchor, point, overlays.snapMode) : point;
        // apply to store vertex directly by moving preview as pending only; for now redraw using local overlay by updating pendingPoints
        moveVertex(drag.shapeId, drag.vertexIndex, next);
      } else if (drag.type === "shape") {
        const currentShape = shapes[drag.shapeId];
        if (!currentShape || currentShape.locked) return;
        const dx = point.x - drag.start.x;
        const dy = point.y - drag.start.y;
        const newPoints = drag.original.map((p) => ({ x: p.x + dx, y: p.y + dy }));
        moveShapePoints(drag.shapeId, newPoints);
      } else if (drag.type === "shapes") {
        const dx = point.x - drag.start.x;
        const dy = point.y - drag.start.y;
        drag.shapeIds.forEach((sid) => {
          const original = drag.originals[sid];
          const shape = shapes[sid];
          if (!original || !shape || shape.locked) return;
          const shifted = original.points.map((p) => ({ x: p.x + dx, y: p.y + dy }));
          moveShapePoints(sid, shifted);
        });
      }
    },
    [handlePointerPosition, overlays.snapMode, moveShapePoints, moveVertex, shapes]
  );

  const handlePointerLeave = useCallback(() => {
    setHoverPreview(null);
    dragRef.current = { type: "none" };
  }, [setHoverPreview]);

  const handlePointerDown = useCallback(
    (event: PointerEvent<SVGSVGElement>) => {
      // Right click (button 2) starts panning the canvas
      if (event.button === 2) {
        const svg = svgRef.current;
        if (!svg) return;
        const pt = svg.createSVGPoint();
        pt.x = event.clientX;
        pt.y = event.clientY;
        const ctm = svg.getScreenCTM();
        if (!ctm) return;
        const sp = pt.matrixTransform(ctm.inverse());
        dragRef.current = { type: "pan", start: { x: sp.x, y: sp.y }, panStart: { ...pan } };
        return;
      }

      if (event.button !== 0) {
        return;
      }

      const point = handlePointerPosition(event);
      if (!point) {
        return;
      }

      if (calibration.mode === "await_first") {
        setCalibrationFirstPoint(point);
        event.stopPropagation();
        return;
      }

      if (calibration.mode === "await_second") {
        const first = calibration.firstPoint;
        if (first) {
          const pixelDistance = distance(point, first);
          if (pixelDistance > 0.5) {
            const unitLabel = units === "mm" ? "millimetres" : "inches";
            const input = window.prompt(
              `Enter the real-world distance between these points (${unitLabel}):`
            );
            if (!input) {
              cancelCalibration();
              return;
            }
            const value = Number.parseFloat(input);
            if (!Number.isFinite(value) || value <= 0) {
              cancelCalibration();
              return;
            }
            const distanceMm = units === "mm" ? value : value * 25.4;
            const mmPerPixel = distanceMm / pixelDistance;
            finalizeCalibration(mmPerPixel);
            event.stopPropagation();
            return;
          }
        }
        cancelCalibration();
        return;
      }

      if (currentTool.mode === "select") {
        const isAdditive = event.shiftKey || event.metaKey || event.ctrlKey;

        // Try vertices first for precision adjustments
        for (let si = shapeOrder.length - 1; si >= 0; si -= 1) {
          const sid = shapeOrder[si];
          const sh = shapes[sid];
          if (!sh) continue;
          const pts = sh.vertexIds.map((id) => vertices[id]).filter(Boolean) as { x: number; y: number }[];
          for (let i = 0; i < pts.length; i += 1) {
            if (distance(point, pts[i]) <= HIT_VERTEX_PX) {
              if (!selection.shapeIds.includes(sid)) {
                selectShape(sid, { append: isAdditive });
              }
              if (!sh.locked) {
                const anchor = pts.length >= 2 ? pts[(i - 1 + pts.length) % pts.length] : undefined;
                dragRef.current = { type: "vertex", shapeId: sid, vertexIndex: i, anchor };
              }
              return;
            }
          }
        }

        // Otherwise select/detect shapes
        for (let si = shapeOrder.length - 1; si >= 0; si -= 1) {
          const sid = shapeOrder[si];
          const sh = shapes[sid];
          if (!sh || !sh.isClosed) continue;
          const pts = sh.vertexIds.map((id) => vertices[id]).filter(Boolean) as { x: number; y: number }[];
          if (pts.length >= 3 && pointInPolygon(point, pts)) {
            const already = selection.shapeIds.includes(sid);
            if (!already) {
              selectShape(sid, { append: isAdditive });
            }

            const selectedIds = selection.shapeIds.includes(sid)
              ? selection.shapeIds
              : [...selection.shapeIds, sid];

            const movable = selectedIds.filter((id) => {
              const shape = shapes[id];
              return shape && !shape.locked;
            });

            if (movable.length === 1) {
              const shape = shapes[movable[0]];
              const ptsCopy = shape
                ? shape.vertexIds
                    .map((vid) => vertices[vid])
                    .filter(Boolean)
                    .map((v) => ({ x: v!.x, y: v!.y }))
                : [];
              dragRef.current = {
                type: "shape",
                shapeId: movable[0],
                start: point,
                original: ptsCopy,
              };
            } else if (movable.length > 1) {
              const originals: Record<string, { points: { x: number; y: number }[] }> = {};
              movable.forEach((id) => {
                const shape = shapes[id];
                if (!shape) return;
                originals[id] = {
                  points: shape.vertexIds
                    .map((vid) => vertices[vid])
                    .filter(Boolean)
                    .map((v) => ({ x: v!.x, y: v!.y })),
                };
              });
              dragRef.current = {
                type: "shapes",
                shapeIds: movable,
                start: point,
                originals,
              };
            }
            return;
          }
        }

        if (!isAdditive) {
          clearSelection();
        }
        dragRef.current = { type: "none" };
        return;
      }

      const currentShape = activeShapeId ? shapes[activeShapeId] : null;

      // 0) Close shape if clicking near first point while drawing
      if (currentShape && !currentShape.isClosed && currentShape.vertexIds.length >= 3) {
        const firstId = currentShape.vertexIds[0];
        const fv = firstId ? vertices[firstId] : null;
        if (fv && distance(point, { x: fv.x, y: fv.y }) <= CLOSURE_THRESHOLD_PX) {
          closeActiveShape();
          return;
        }
      }

      // 1) Drawing flow (polyline by default)
      if (!currentShape || currentShape.isClosed) {
        startNewShape(point);
        return;
      }

      // Apply snapping while drawing
      let nextPoint = point;
      if (currentShape.vertexIds.length > 0) {
        const lastId = currentShape.vertexIds[currentShape.vertexIds.length - 1];
        const last = vertices[lastId];
        if (last) nextPoint = snapFrom({ x: last.x, y: last.y }, point, overlays.snapMode);
      }
      addPointToActiveShape(nextPoint);
    },
    [
      activeShapeId,
      addPointToActiveShape,
      closeActiveShape,
      handlePointerPosition,
      overlays.snapMode,
      currentTool,
      shapeOrder,
      selection.shapeIds,
      selectShape,
      clearSelection,
      shapes,
      startNewShape,
      vertices,
      calibration.mode,
      calibration.firstPoint,
      setCalibrationFirstPoint,
      finalizeCalibration,
      cancelCalibration,
      units,
    ]
  );

  const handlePointerUp = useCallback(() => {
    dragRef.current = { type: "none" };
  }, []);

  const renderedShapes = useMemo(() => {
    return shapeOrder.map((shapeId) => {
      const shape = shapes[shapeId];
      if (!shape) {
        return null;
      }

      const points = shape.vertexIds
        .map((vertexId) => vertices[vertexId])
        .filter(Boolean) as { x: number; y: number }[];

      if (points.length === 0) {
        return null;
      }

      const pathPoints = points.map((point) => `${point.x},${point.y}`).join(" ");
      const isSelected = selection.shapeIds.includes(shapeId);

      return (
        <g key={shapeId}>
          {shape.isClosed ? (
            <polygon
              points={pathPoints}
              className={`fill-sky-500/10 ${isSelected ? "stroke-sky-200" : "stroke-sky-400/70"}`}
              strokeWidth={isSelected ? 3 : 2}
            />
          ) : (
            <polyline
              points={pathPoints}
              className={`fill-none ${isSelected ? "stroke-sky-200" : "stroke-sky-400/80"}`}
              strokeWidth={isSelected ? 3 : 2}
            />
          )}
          {points.map((point, index) => (
            <circle
              key={`${shapeId}-${index}`}
              cx={point.x}
              cy={point.y}
              r={6}
              className={`fill-slate-950 ${isSelected ? "stroke-sky-200" : "stroke-white"}`}
              strokeWidth={isSelected ? 2 : 1.5}
            />
          ))}
          {shape.locked && (
            <text
              x={points[0].x}
              y={points[0].y - 12}
              className="fill-amber-400 text-xs font-semibold"
            >
              Locked
            </text>
          )}
        </g>
      );
    });
  }, [shapeOrder, shapes, vertices, selection.shapeIds]);

  const previewPath = useMemo(() => {
    if (!activeShapeId) {
      return null;
    }
    const shape = shapes[activeShapeId];
    if (!shape) {
      return null;
    }

    const points = shape.vertexIds
      .map((vertexId) => vertices[vertexId])
      .filter(Boolean) as { x: number; y: number }[];

    if (points.length === 0) {
      return null;
    }

    const combined = [...points];
    if (pendingPoints[0]) {
      // Show preview exactly at cursor to avoid perceived gap
      combined.push(pendingPoints[0]);
    }

    const pathPoints = combined.map((point) => `${point.x},${point.y}`).join(" ");

    return (
      <polyline
        points={pathPoints}
        className="pointer-events-none fill-none stroke-sky-300/50"
        strokeDasharray="6 6"
        strokeWidth={1.5}
      />
    );
  }, [activeShapeId, pendingPoints, shapes, vertices]);

  const applyZoom = useCallback(
    (factor: number, pivot: { x: number; y: number } = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 }) => {
      const nextScale = clamp(scale * factor, 0.2, 5);
      if (nextScale === scale) {
        return;
      }
      const worldPivotX = (pivot.x - pan.x) / scale;
      const worldPivotY = (pivot.y - pan.y) / scale;
      setPan({
        x: pivot.x - worldPivotX * nextScale,
        y: pivot.y - worldPivotY * nextScale,
      });
      setScale(nextScale);
    },
    [scale, pan.x, pan.y]
  );

  const resetView = useCallback(() => {
    setPan({ x: 0, y: 0 });
    setScale(1);
  }, []);

  const computeBounds = useCallback(
    (ids: string[]) => {
      const bounds = ids.reduce(
        (acc, shapeId) => {
          const shape = shapes[shapeId];
          if (!shape || !shape.isClosed) {
            return acc;
          }
          shape.vertexIds.forEach((vid) => {
            const vertex = vertices[vid];
            if (!vertex) {
              return;
            }
            acc.minX = Math.min(acc.minX, vertex.x);
            acc.maxX = Math.max(acc.maxX, vertex.x);
            acc.minY = Math.min(acc.minY, vertex.y);
            acc.maxY = Math.max(acc.maxY, vertex.y);
          });
          return acc;
        },
        {
          minX: Number.POSITIVE_INFINITY,
          maxX: Number.NEGATIVE_INFINITY,
          minY: Number.POSITIVE_INFINITY,
          maxY: Number.NEGATIVE_INFINITY,
        }
      );

      if (
        bounds.minX === Number.POSITIVE_INFINITY ||
        bounds.maxX === Number.NEGATIVE_INFINITY ||
        bounds.minY === Number.POSITIVE_INFINITY ||
        bounds.maxY === Number.NEGATIVE_INFINITY
      ) {
        return null;
      }

      return bounds;
    },
    [shapes, vertices]
  );

  const applyBoundsToView = useCallback((bounds: { minX: number; maxX: number; minY: number; maxY: number }) => {
    const padding = 40;
    const width = Math.max(bounds.maxX - bounds.minX, 1);
    const height = Math.max(bounds.maxY - bounds.minY, 1);
    const availableWidth = CANVAS_WIDTH - padding * 2;
    const availableHeight = CANVAS_HEIGHT - padding * 2;
    const scaleX = availableWidth / width;
    const scaleY = availableHeight / height;
    const nextScale = clamp(Math.min(scaleX, scaleY), 0.2, 5);
    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;
    setScale(nextScale);
    setPan({
      x: CANVAS_WIDTH / 2 - centerX * nextScale,
      y: CANVAS_HEIGHT / 2 - centerY * nextScale,
    });
  }, []);

  const fitToView = useCallback(() => {
    if (shapeOrder.length === 0) {
      resetView();
      return;
    }
    const bounds = computeBounds(shapeOrder);
    if (!bounds) {
      resetView();
      return;
    }
    applyBoundsToView(bounds);
  }, [shapeOrder, computeBounds, applyBoundsToView, resetView]);

  const zoomToSelection = useCallback(() => {
    const targetIds = selection.shapeIds.length > 0 ? selection.shapeIds : shapeOrder;
    if (targetIds.length === 0) {
      resetView();
      return;
    }
    const bounds = computeBounds(targetIds);
    if (!bounds) {
      resetView();
      return;
    }
    applyBoundsToView(bounds);
  }, [selection.shapeIds, shapeOrder, computeBounds, applyBoundsToView, resetView]);

  const handleZoomIn = useCallback(() => applyZoom(1.15), [applyZoom]);
  const handleZoomOut = useCallback(() => applyZoom(1 / 1.15), [applyZoom]);

  const effectiveMmPerPixel = useMemo(() => {
    const value = calibration.mmPerPixel;
    if (value && Number.isFinite(value) && value > 0) {
      return value;
    }
    return 1;
  }, [calibration.mmPerPixel]);

  const safeMarginElement = useMemo(() => {
    if (!overlays.showSafeMargins) {
      return null;
    }
    const marginPx = calibration.safeMarginMm / effectiveMmPerPixel;
    if (!Number.isFinite(marginPx) || marginPx <= 0) {
      return null;
    }
    const width = CANVAS_WIDTH - marginPx * 2;
    const height = CANVAS_HEIGHT - marginPx * 2;
    if (width <= 0 || height <= 0) {
      return null;
    }
    const labelValue = units === "mm" ? calibration.safeMarginMm : calibration.safeMarginMm / 25.4;
    const labelUnit = units === "mm" ? "mm" : "in";
    const displayPrecision = Math.min(precision, 3);
    return (
      <g key="safe-margin">
        <rect
          x={marginPx}
          y={marginPx}
          width={width}
          height={height}
          className="pointer-events-none fill-transparent stroke-amber-400/70"
          strokeDasharray="12 6"
          strokeWidth={2}
        />
        <text
          x={marginPx + 12}
          y={marginPx + 20}
          className="pointer-events-none fill-amber-200 text-[12px] font-semibold"
        >
          Safe margin: {labelValue.toFixed(displayPrecision)} {labelUnit}
        </text>
      </g>
    );
  }, [
    overlays.showSafeMargins,
    calibration.safeMarginMm,
    effectiveMmPerPixel,
    units,
    precision,
  ]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70">
      <svg
        id="quote-canvas"
        ref={svgRef}
        viewBox="0 0 1200 800"
        className="h-[540px] w-full cursor-crosshair"
        onContextMenu={(e) => e.preventDefault()}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerUp={handlePointerUp}
      >
        <g transform={`translate(${pan.x},${pan.y}) scale(${scale})`}>
          {overlays.showGrid && (
            <CanvasGrid density={overlays.gridDensity} mmPerPixel={effectiveMmPerPixel} />
          )}
          {safeMarginElement}
          {renderedShapes}
          {previewPath}
        </g>
      </svg>
      <Rulers pan={pan} scale={scale} mmPerPixel={effectiveMmPerPixel} units={units} />
      {calibration.mode !== "idle" && (
        <div className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-amber-400/90 px-4 py-2 text-xs font-semibold text-slate-950 shadow-lg">
          {calibration.mode === "await_first"
            ? "Click the first reference point"
            : "Click the second reference point"}
        </div>
      )}
      <div className="pointer-events-auto absolute right-3 top-3 flex flex-col items-end gap-2 text-xs">
        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-slate-900/70 p-1 shadow-lg">
          <button
            type="button"
            onClick={handleZoomOut}
            className="rounded-full px-2 py-1 text-white transition hover:bg-white/10"
          >
            −
          </button>
          <span className="min-w-12 px-2 text-center text-slate-300">{Math.round(scale * 100)}%</span>
          <button
            type="button"
            onClick={handleZoomIn}
            className="rounded-full px-2 py-1 text-white transition hover:bg-white/10"
          >
            +
          </button>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-slate-900/70 p-1 shadow-lg">
          <button
            type="button"
            onClick={fitToView}
            className="rounded-full px-3 py-1 text-white transition hover:bg-white/10"
          >
            Fit
          </button>
          <button
            type="button"
            onClick={zoomToSelection}
            className="rounded-full px-3 py-1 text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={selection.shapeIds.length === 0}
          >
            Selection
          </button>
          <button
            type="button"
            onClick={resetView}
            className="rounded-full px-3 py-1 text-white transition hover:bg-white/10"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

function CanvasGrid({ density, mmPerPixel }: { density: "coarse" | "medium" | "fine"; mmPerPixel: number }) {
  const mmpp = mmPerPixel > 0 ? mmPerPixel : 1;
  let stepMm = density === "fine" ? 50 : density === "medium" ? 100 : 200;
  let stepPx = stepMm / mmpp;

  while (stepPx < 12) {
    stepMm *= 2;
    stepPx = stepMm / mmpp;
  }

  const lines: JSX.Element[] = [];
  const majorEvery = 5;

  let index = 0;
  for (let x = 0; x <= CANVAS_WIDTH + 0.1; x += stepPx) {
    const isMajor = index % majorEvery === 0;
    lines.push(
      <line
        key={`v-${index}`}
        x1={x}
        y1={0}
        x2={x}
        y2={CANVAS_HEIGHT}
        className={isMajor ? "stroke-white/12" : "stroke-white/6"}
        strokeWidth={isMajor ? 0.8 : 0.4}
      />
    );
    index += 1;
  }

  index = 0;
  for (let y = 0; y <= CANVAS_HEIGHT + 0.1; y += stepPx) {
    const isMajor = index % majorEvery === 0;
    lines.push(
      <line
        key={`h-${index}`}
        x1={0}
        y1={y}
        x2={CANVAS_WIDTH}
        y2={y}
        className={isMajor ? "stroke-white/12" : "stroke-white/6"}
        strokeWidth={isMajor ? 0.8 : 0.4}
      />
    );
    index += 1;
  }

  return <g>{lines}</g>;
}

function Rulers({
  pan,
  scale,
  mmPerPixel,
  units,
}: {
  pan: { x: number; y: number };
  scale: number;
  mmPerPixel: number;
  units: "mm" | "in";
}) {
  const mmpp = mmPerPixel > 0 ? mmPerPixel : 1;
  const unitLabel = units === "mm" ? "mm" : "in";
  const decimals = units === "mm" ? 0 : 2;

  const toUnits = useCallback(
    (mm: number) => (units === "mm" ? mm : mm / 25.4),
    [units]
  );

  const ticks = useMemo(() => {
    const buildTicks = (axis: "x" | "y") => {
      const viewSize = axis === "x" ? CANVAS_WIDTH : CANVAS_HEIGHT;
      const panValue = axis === "x" ? pan.x : pan.y;
      const visibleMin = (-panValue) / scale;
      const visibleMax = (viewSize - panValue) / scale;
      const mmMin = visibleMin * mmpp;
      const mmMax = visibleMax * mmpp;
      if (!Number.isFinite(mmMin) || !Number.isFinite(mmMax) || mmMax <= mmMin) {
        return [];
      }

      const candidates = [1, 2, 5, 10, 20, 25, 50, 100, 200, 500, 1000, 2000, 5000];
      let stepMm = candidates[candidates.length - 1];
      for (const candidate of candidates) {
        const stepPx = (candidate / mmpp) * scale;
        if (stepPx >= 40) {
          stepMm = candidate;
          break;
        }
      }

      const firstTickMm = Math.ceil(mmMin / stepMm) * stepMm;
      const axisTicks: { position: number; label: number }[] = [];
      for (let valueMm = firstTickMm; valueMm <= mmMax; valueMm += stepMm) {
        const world = valueMm / mmpp;
        const screen = world * scale + panValue;
        if (screen < -50 || screen > viewSize + 50) {
          continue;
        }
        axisTicks.push({ position: screen, label: toUnits(valueMm) });
      }
      return axisTicks;
    };

    return {
      x: buildTicks("x"),
      y: buildTicks("y"),
    };
  }, [mmpp, pan.x, pan.y, scale, toUnits]);

  const formatLabel = useCallback(
    (value: number) => value.toFixed(decimals),
    [decimals]
  );

  return (
    <div className="pointer-events-none absolute inset-0">
      <svg
        className="absolute left-0 top-0 h-6 w-full"
        viewBox={`0 0 ${CANVAS_WIDTH} 24`}
        aria-hidden
      >
        <rect width="100%" height="100%" className="fill-slate-900/85" />
        {ticks.x.map((tick) => (
          <g key={`rx-${tick.position.toFixed(2)}`} transform={`translate(${tick.position},0)`}>
            <line y1={12} y2={24} className="stroke-white/45" strokeWidth={1} />
            <text
              x={0}
              y={10}
              textAnchor="middle"
              className="fill-white text-[10px]"
            >
              {formatLabel(tick.label)}
            </text>
          </g>
        ))}
        <rect width={24} height={24} className="fill-slate-900" />
        <text
          x={CANVAS_WIDTH - 8}
          y={12}
          textAnchor="end"
          className="fill-slate-300 text-[9px] uppercase tracking-[0.3em]"
        >
          {unitLabel}
        </text>
      </svg>
      <svg
        className="absolute left-0 top-0 h-full w-6"
        viewBox={`0 0 24 ${CANVAS_HEIGHT}`}
        aria-hidden
      >
        <rect width="100%" height="100%" className="fill-slate-900/85" />
        {ticks.y.map((tick) => (
          <g key={`ry-${tick.position.toFixed(2)}`} transform={`translate(0,${tick.position})`}>
            <line x1={12} x2={24} y1={0} y2={0} className="stroke-white/45" strokeWidth={1} />
            <text
              x={6}
              y={-2}
              textAnchor="end"
              className="fill-white text-[10px]"
            >
              {formatLabel(tick.label)}
            </text>
          </g>
        ))}
        <rect width={24} height={24} className="fill-slate-900" />
      </svg>
    </div>
  );
}

function ArrangePanel() {
  const shapeOrder = useQuoteStore(quoteStoreSelectors.shapeOrder);
  const arrangement = useQuoteStore((s) => s.arrangement);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const { ensureArrangementForClosedShapes, moveArrangementItem } = useQuoteStore(
    quoteStoreSelectors.actions
  );

  type Drag =
    | { type: "none" }
    | { type: "item"; id: string; start: { x: number; y: number }; origin: { x: number; y: number } }
    | { type: "pan"; start: { x: number; y: number }; panStart: { x: number; y: number } };
  const draggingRef = useRef<Drag>({ type: "none" });
  const svgRef = useRef<SVGSVGElement | null>(null);

  const toLocal = useCallback((evt: PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const pt = svg.createSVGPoint();
    pt.x = evt.clientX;
    pt.y = evt.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const p = pt.matrixTransform(ctm.inverse());
    return { x: (p.x - pan.x) / scale, y: (p.y - pan.y) / scale };
  }, [scale, pan.x, pan.y]);

  const onDown = useCallback(
    (evt: PointerEvent<SVGSVGElement>, sid: string) => {
      // Only start dragging item on left-click
      // @ts-expect-error button exists on PointerEvent
      if ((evt as any).button !== 0) return;
      const p = toLocal(evt);
      if (!p) return;
      const pos = arrangement[sid] ?? { x: 20, y: 20, points: [] };
      draggingRef.current = { type: "item", id: sid, start: p, origin: { x: pos.x, y: pos.y } };
    },
    [toLocal, arrangement]
  );

  const onMove = useCallback(
    (evt: PointerEvent<SVGSVGElement>) => {
      const d = draggingRef.current;
      if (d.type === "pan") {
        const svg = svgRef.current;
        if (!svg) return;
        const pt = svg.createSVGPoint();
        pt.x = evt.clientX;
        pt.y = evt.clientY;
        const ctm = svg.getScreenCTM();
        if (!ctm) return;
        const sp = pt.matrixTransform(ctm.inverse());
        const dx = sp.x - d.start.x;
        const dy = sp.y - d.start.y;
        setPan({ x: d.panStart.x + dx, y: d.panStart.y + dy });
        return;
      }

      if (d.type !== "item") return;
      const p = toLocal(evt);
      if (!p) return;
      const dx = p.x - d.start.x;
      const dy = p.y - d.start.y;
      const nx = d.origin.x + dx;
      const ny = d.origin.y + dy;
      moveArrangementItem(d.id, nx, ny);
    },
    [toLocal, moveArrangementItem]
  );

  const onUp = useCallback(() => {
    draggingRef.current = { type: "none" };
  }, []);

  const onSvgPointerDown = useCallback(
    (evt: PointerEvent<SVGSVGElement>) => {
      // Start panning on right-click anywhere in the panel
      // @ts-expect-error button exists on PointerEvent
      if ((evt as any).button !== 2) return;
      const svg = svgRef.current;
      if (!svg) return;
      const pt = svg.createSVGPoint();
      pt.x = evt.clientX;
      pt.y = evt.clientY;
      const ctm = svg.getScreenCTM();
      if (!ctm) return;
      const sp = pt.matrixTransform(ctm.inverse());
      draggingRef.current = { type: "pan", start: { x: sp.x, y: sp.y }, panStart: { ...pan } };
    },
    [pan]
  );

  const rendered = useMemo(() => {
    return shapeOrder.map((sid) => {
      const item = arrangement[sid];
      if (!item || item.points.length < 2) return null;
      const localScale = 0.7;
      const path = item.points.map((p) => `${p.x * localScale},${p.y * localScale}`).join(" ");
      return (
        <g
          key={sid}
          transform={`translate(${item.x},${item.y})`}
          onPointerDown={(e) => onDown(e as unknown as PointerEvent<SVGSVGElement>, sid)}
          className="cursor-move"
        >
          <polygon points={path} className="fill-rose-700/70 stroke-black" strokeWidth={2} />
        </g>
      );
    });
  }, [shapeOrder, arrangement, onDown]);

  // Ensure arrangement items exist for closed shapes; safe no-op after first time
  useEffect(() => {
    ensureArrangementForClosedShapes();
  }, [shapeOrder, ensureArrangementForClosedShapes]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70">
      <svg
        ref={svgRef}
        viewBox="0 0 1200 800"
        className="h-[540px] w-full"
        onPointerMove={(e) => onMove(e as unknown as PointerEvent<SVGSVGElement>)}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        onPointerDown={onSvgPointerDown}
        onContextMenu={(e) => e.preventDefault()}
      >
        <g transform={`translate(${pan.x},${pan.y}) scale(${scale})`}>
          {/* slab backdrop */}
          <rect x={0} y={0} width={1200} height={800} className="fill-rose-900/40" />
          {rendered}
        </g>
      </svg>
      <div className="pointer-events-auto absolute right-3 top-3 flex items-center gap-1 rounded-full border border-white/10 bg-slate-900/70 p-1 text-xs">
        <button type="button" className="rounded-full px-2 py-1 text-white hover:bg-white/10" onClick={() => setScale((s)=> Math.max(0.5, +(s-0.1).toFixed(2)))}>−</button>
        <span className="min-w-12 px-2 text-center text-slate-300">{Math.round(scale*100)}%</span>
        <button type="button" className="rounded-full px-2 py-1 text-white hover:bg-white/10" onClick={() => setScale(1)}>100%</button>
        <button type="button" className="rounded-full px-2 py-1 text-white hover:bg-white/10" onClick={() => setScale((s)=> Math.min(3, +(s+0.1).toFixed(2)))}>+</button>
      </div>
    </div>
  );
}

function Sidebar() {
  const { areaSqm, perimeterMm, benchtop, extras, grand } = useQuoteStore(
    quoteStoreSelectors.totals
  );
  const ratePerSqm = useQuoteStore(quoteStoreSelectors.ratePerSqm);
  const calibration = useQuoteStore(quoteStoreSelectors.calibration);
  const overlays = useQuoteStore(quoteStoreSelectors.overlays);
  const units = useQuoteStore(quoteStoreSelectors.units);
  const precision = useQuoteStore(quoteStoreSelectors.precision);
  const {
    setRatePerSqm,
    toggleOverlay,
    setGridDensity,
    toggleSafeMargins,
    setSafeMarginMm,
    beginCalibration,
    cancelCalibration,
    setUnits,
    setPrecision,
  } = useQuoteStore(quoteStoreSelectors.actions);

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-AU", {
        style: "currency",
        currency: "AUD",
        maximumFractionDigits: 2,
      }),
    []
  );

  const decimals = Math.min(Math.max(precision, 0), 4);
  const areaValue = units === "mm" ? areaSqm : areaSqm * 10.7639104167;
  const areaUnit = units === "mm" ? "m²" : "ft²";
  const perimeterValue = units === "mm" ? perimeterMm : perimeterMm / 25.4;
  const perimeterUnit = units === "mm" ? "mm" : "in";
  const safeMarginValue = units === "mm"
    ? calibration.safeMarginMm
    : calibration.safeMarginMm / 25.4;
  const safeMarginDecimals = Math.min(Math.max(precision, 0), 3);
  const areaDecimals = Math.min(decimals, 3);
  const perimeterDecimals = Math.min(decimals, 3);

  const mmPerPixelText = calibration.mmPerPixel
    ? `${calibration.mmPerPixel.toFixed(3)} mm/px (${(calibration.mmPerPixel / 25.4).toFixed(3)} in/px)`
    : "Not set";

  const calibrationStatus =
    calibration.mode === "await_first"
      ? "Select first reference point"
      : calibration.mode === "await_second"
        ? "Select second reference point"
        : "Idle";

  const handleSafeMarginChange = (value: string) => {
    const parsed = Number.parseFloat(value);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return;
    }
    setSafeMarginMm(units === "mm" ? parsed : parsed * 25.4);
  };

  const handlePrecisionChange = (value: string) => {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed)) {
      return;
    }
    setPrecision(Math.max(0, Math.min(4, parsed)));
  };

  return (
    <aside className="flex h-full flex-col gap-4 rounded-3xl border border-white/10 bg-slate-950/70 p-6 text-sm text-slate-200">
      <section className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Calibration & Units
        </h2>
        <div className="space-y-2 text-xs text-slate-300">
          <div className="flex items-center justify-between">
            <span>Calibration scale</span>
            <span className="font-medium text-white">{mmPerPixelText}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Status</span>
            <span className="font-medium text-slate-200">{calibrationStatus}</span>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => beginCalibration()}
              disabled={calibration.mode !== "idle"}
              className="flex-1 rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:border-white/40 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Start calibration
            </button>
            {calibration.mode !== "idle" && (
              <button
                type="button"
                onClick={() => cancelCalibration()}
                className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 pt-2">
          <label className="flex flex-col gap-1 text-xs text-slate-300">
            <span>Units</span>
            <select
              value={units}
              onChange={(event) => setUnits(event.target.value as "mm" | "in")}
              className="rounded-xl border border-white/10 bg-slate-900 px-3 py-1 text-sm text-white focus:border-sky-400 focus:outline-none"
            >
              <option value="mm">Metric (mm)</option>
              <option value="in">Imperial (in)</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-slate-300">
            <span>Precision (decimals)</span>
            <input
              type="number"
              min={0}
              max={4}
              value={precision}
              onChange={(event) => handlePrecisionChange(event.target.value)}
              className="rounded-xl border border-white/10 bg-slate-900 px-3 py-1 text-right text-sm text-white focus:border-sky-400 focus:outline-none"
            />
          </label>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Grid & Guides
        </h3>
        <div className="grid gap-2 text-xs text-slate-300">
          <button
            type="button"
            onClick={() => toggleOverlay("showGrid")}
            className="flex items-center justify-between rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
          >
            <span>Grid visibility</span>
            <span className="text-slate-200">{overlays.showGrid ? "On" : "Off"}</span>
          </button>
          <label className="flex flex-col gap-1">
            <span>Grid density</span>
            <select
              value={overlays.gridDensity}
              onChange={(event) => setGridDensity(event.target.value as "coarse" | "medium" | "fine")}
              className="rounded-xl border border-white/10 bg-slate-900 px-3 py-1 text-sm text-white focus:border-sky-400 focus:outline-none"
            >
              <option value="coarse">Coarse (200 mm)</option>
              <option value="medium">Medium (100 mm)</option>
              <option value="fine">Fine (50 mm)</option>
            </select>
          </label>
          <button
            type="button"
            onClick={() => toggleSafeMargins()}
            className="flex items-center justify-between rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
          >
            <span>Safe margin overlay</span>
            <span className="text-slate-200">{overlays.showSafeMargins ? "On" : "Off"}</span>
          </button>
          <label className="flex flex-col gap-1">
            <span>Safe margin ({units === "mm" ? "mm" : "in"})</span>
            <input
              type="number"
              min={0}
              step="0.1"
              value={Number.isFinite(safeMarginValue) ? Number(safeMarginValue.toFixed(safeMarginDecimals)) : 0}
              onChange={(event) => handleSafeMarginChange(event.target.value)}
              className="rounded-xl border border-white/10 bg-slate-900 px-3 py-1 text-right text-sm text-white focus:border-sky-400 focus:outline-none"
            />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => toggleOverlay("showAngles")}
              className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
            >
              Angles {overlays.showAngles ? "On" : "Off"}
            </button>
            <button
              type="button"
              onClick={() => toggleOverlay("showEdgeLabels")}
              className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
            >
              Edge labels {overlays.showEdgeLabels ? "On" : "Off"}
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Pricing
        </h3>
        <label className="flex items-center justify-between gap-3">
          <span className="text-xs uppercase tracking-wide text-slate-400">
            Rate per m²
          </span>
          <input
            type="number"
            min={0}
            value={ratePerSqm}
            onChange={(event) => setRatePerSqm(Number(event.target.value) || 0)}
            className="w-28 rounded-xl border border-white/10 bg-slate-900 px-3 py-1 text-right text-sm text-white focus:border-sky-400 focus:outline-none"
          />
        </label>
      </section>

      <section className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Quote totals
        </h3>
        <dl className="space-y-1">
          <div className="flex justify-between">
            <dt className="text-slate-300">Area</dt>
            <dd className="font-medium text-white">
              {areaValue.toFixed(areaDecimals)} {areaUnit}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-300">Perimeter</dt>
            <dd className="font-medium text-white">
              {perimeterValue.toFixed(perimeterDecimals)} {perimeterUnit}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-300">Benchtop</dt>
            <dd className="font-semibold text-white">{currencyFormatter.format(benchtop)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-300">Extras</dt>
            <dd className="font-medium text-white">{currencyFormatter.format(extras)}</dd>
          </div>
        </dl>
        <div className="mt-3 flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
          <span className="text-xs uppercase tracking-wide text-slate-300">Grand total</span>
          <span className="text-lg font-semibold text-white">
            {currencyFormatter.format(grand)}
          </span>
        </div>
      </section>

      <div className="mt-auto space-y-3">
        <button
          type="button"
          className="w-full rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
        >
          Save draft
        </button>
        <button
          type="button"
          className="w-full rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
        >
          Preview quote
        </button>
      </div>
    </aside>
  );
}

export function QuoteBuilder() {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-center justify-center">
        <Toolbar />
      </div>
      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
        <QuoteCanvas />
        <ArrangePanel />
      </div>
      <div className="flex w-full justify-end">
        <div className="w-full lg:w-[420px]">
          <Sidebar />
        </div>
      </div>
    </div>
  );
}