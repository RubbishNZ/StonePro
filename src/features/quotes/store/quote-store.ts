"use client";

import { create } from "zustand";

import type { Vec2 } from "@/features/quotes/lib/geometry";
import {
  calculateShapeMetrics,
} from "@/features/quotes/lib/geometry";

type Shape = {
  id: string;
  vertexIds: string[];
  isClosed: boolean;
  label?: string;
  groupId?: string | null;
  locked?: boolean;
};

type Vertex = {
  id: string;
  shapeId: string;
  x: number;
  y: number;
  angleDeg?: number;
  isReference: boolean;
};

type ExtrasItem = {
  id: string;
  name: string;
  unit: "sqm" | "lm" | "mm" | "ea" | "hr" | "custom";
  qty: number;
  unitPrice: number;
  lineTotal: number;
  notes?: string;
};

type QuoteTotals = {
  areaSqm: number;
  perimeterMm: number;
  benchtop: number;
  extras: number;
  grand: number;
};

type CustomerDetails = {
  name: string;
  project: string;
  email: string;
  phone: string;
};

type QuoteStoreState = {
  shapeOrder: string[];
  shapes: Record<string, Shape>;
  vertices: Record<string, Vertex>;
  activeShapeId: string | null;
  pendingPoints: Vec2[]; // Used for previewing current pointer
  selection: {
    shapeIds: string[];
    vertexIds: string[];
  };
  groups: Record<string, { id: string; shapeIds: string[] }>;
  currentTool: {
    mode:
      | "select"
      | "polyline"
      | "rectangle"
      | "circle"
      | "arc"
      | "notch"
      | "slot";
    subMode?: string | null;
  };
  calibration: {
    mmPerPixel: number | null;
    mode: "idle" | "await_first" | "await_second";
    firstPoint: Vec2 | null;
    safeMarginMm: number;
  };
  overlays: {
    showGrid: boolean;
    showAngles: boolean;
    showEdgeLabels: boolean;
    showSafeMargins: boolean;
    gridDensity: "coarse" | "medium" | "fine";
    snapMode: "off" | "90" | "90_45";
  };
  ratePerSqm: number;
  extras: ExtrasItem[];
  totals: QuoteTotals;
  customer: CustomerDetails;
  // Independent arrangement (slab layout) per shape
  arrangement: Record<string, { points: Vec2[]; x: number; y: number }>;
  units: "mm" | "in";
  precision: number;
  actions: {
    startNewShape: (point: Vec2) => void;
    addPointToActiveShape: (point: Vec2) => void;
    closeActiveShape: () => void;
    undoLastPoint: () => void;
    setHoverPreview: (point: Vec2 | null) => void;
    setRatePerSqm: (value: number) => void;
    toggleOverlay: (key: keyof QuoteStoreState["overlays"]) => void;
    moveVertex: (shapeId: string, vertexIndex: number, point: Vec2) => void;
    moveShapePoints: (shapeId: string, points: Vec2[]) => void;
    ensureArrangementForClosedShapes: () => void;
    moveArrangementItem: (shapeId: string, x: number, y: number) => void;
    setTool: (
      tool:
        | "select"
        | "polyline"
        | "rectangle"
        | "circle"
        | "arc"
        | "notch"
        | "slot",
      subMode?: string | null
    ) => void;
    selectShape: (shapeId: string, options?: { append?: boolean; toggle?: boolean }) => void;
    clearSelection: () => void;
    selectShapes: (shapeIds: string[]) => void;
    groupSelectedShapes: () => void;
    ungroupSelectedShapes: () => void;
    deleteSelectedShapes: () => void;
    lockSelectedShapes: (locked: boolean) => void;
    setGridDensity: (density: "coarse" | "medium" | "fine") => void;
    toggleSafeMargins: () => void;
    setSafeMarginMm: (mm: number) => void;
    clearAllShapes: () => void;
    beginCalibration: () => void;
    cancelCalibration: () => void;
    setCalibrationFirstPoint: (point: Vec2) => void;
    finalizeCalibration: (mmPerPixel: number) => void;
    setUnits: (units: "mm" | "in") => void;
    setPrecision: (precision: number) => void;
  };
};

function createTotals(
  shapeOrder: string[],
  shapes: Record<string, Shape>,
  vertices: Record<string, Vertex>,
  mmPerPixel: number | null,
  ratePerSqm: number,
  extras: ExtrasItem[]
): QuoteTotals {
  let areaSqm = 0;
  let perimeterMm = 0;

  shapeOrder.forEach((shapeId) => {
    const shape = shapes[shapeId];
    if (!shape || !shape.isClosed) {
      return;
    }

    const orderedPoints = shape.vertexIds
      .map((vertexId) => vertices[vertexId])
      .filter((vertex): vertex is Vertex => Boolean(vertex))
      .map((vertex) => ({ x: vertex.x, y: vertex.y }));

    if (orderedPoints.length < 3) {
      return;
    }

    const { areaSqm: area, perimeterMm: perimeter } = calculateShapeMetrics(
      orderedPoints,
      mmPerPixel
    );

    areaSqm += area;
    perimeterMm += perimeter;
  });

  const extrasSubtotal = extras.reduce((sum, item) => sum + item.lineTotal, 0);
  const benchtop = areaSqm * ratePerSqm;
  const grand = benchtop + extrasSubtotal;

  return {
    areaSqm,
    perimeterMm,
    benchtop,
    extras: extrasSubtotal,
    grand,
  };
}

function randomId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
}

export const useQuoteStore = create<QuoteStoreState>((set, get) => ({
  shapeOrder: [],
  shapes: {},
  vertices: {},
  activeShapeId: null,
  pendingPoints: [],
  selection: {
    shapeIds: [],
    vertexIds: [],
  },
  groups: {},
  currentTool: {
    mode: "polyline",
    subMode: null,
  },
  calibration: {
    mmPerPixel: null,
    mode: "idle",
    firstPoint: null,
    safeMarginMm: 50,
  },
  overlays: {
    showGrid: false,
    showAngles: false,
    showEdgeLabels: true,
    showSafeMargins: false,
    gridDensity: "medium",
    snapMode: "off",
  },
  ratePerSqm: 950,
  extras: [],
  totals: {
    areaSqm: 0,
    perimeterMm: 0,
    benchtop: 0,
    extras: 0,
    grand: 0,
  },
  customer: {
    name: "",
    project: "",
    email: "",
    phone: "",
  },
  arrangement: {},
  units: "mm",
  precision: 2,
  actions: {
    startNewShape: (point) => {
      const shapeId = randomId();
      const vertexId = randomId();

      set((state) => {
        const nextShapeOrder = [...state.shapeOrder, shapeId];
        const nextShapes = {
          ...state.shapes,
          [shapeId]: {
            id: shapeId,
            vertexIds: [vertexId],
            isClosed: false,
          },
        } satisfies Record<string, Shape>;

        const nextVertices = {
          ...state.vertices,
          [vertexId]: {
            id: vertexId,
            shapeId,
            x: point.x,
            y: point.y,
            isReference: false,
          },
        } satisfies Record<string, Vertex>;

        return {
          shapeOrder: nextShapeOrder,
          shapes: nextShapes,
          vertices: nextVertices,
          activeShapeId: shapeId,
          selection: {
            shapeIds: [shapeId],
            vertexIds: [vertexId],
          },
          totals: createTotals(
            nextShapeOrder,
            nextShapes,
            nextVertices,
            state.calibration.mmPerPixel,
            state.ratePerSqm,
            state.extras
          ),
        };
      });
    },
    addPointToActiveShape: (point) => {
      const { activeShapeId, shapes } = get();

      if (!activeShapeId) {
        return;
      }

      const shape = shapes[activeShapeId];

      if (!shape || shape.isClosed) {
        return;
      }

      const vertexId = randomId();

      set((state) => {
        const currentShape = state.shapes[activeShapeId];
        if (!currentShape || currentShape.isClosed) {
          return {};
        }

        const nextShape = {
          ...currentShape,
          vertexIds: [...currentShape.vertexIds, vertexId],
        } satisfies Shape;

        const nextShapes = {
          ...state.shapes,
          [activeShapeId]: nextShape,
        } satisfies Record<string, Shape>;

        const nextVertices = {
          ...state.vertices,
          [vertexId]: {
            id: vertexId,
            shapeId: activeShapeId,
            x: point.x,
            y: point.y,
            isReference: false,
          },
        } satisfies Record<string, Vertex>;

        return {
          shapes: nextShapes,
          vertices: nextVertices,
          selection: {
            shapeIds: [activeShapeId],
            vertexIds: [...currentShape.vertexIds, vertexId],
          },
          totals: createTotals(
            state.shapeOrder,
            nextShapes,
            nextVertices,
            state.calibration.mmPerPixel,
            state.ratePerSqm,
            state.extras
          ),
        };
      });
    },
    closeActiveShape: () => {
      const stateNow = get();
      let targetId = stateNow.activeShapeId;
      if (!targetId) {
        // Fallback: close the most recent open shape with >=3 points
        for (let i = stateNow.shapeOrder.length - 1; i >= 0; i -= 1) {
          const sid = stateNow.shapeOrder[i];
          const s = stateNow.shapes[sid];
          if (s && !s.isClosed && s.vertexIds.length >= 3) {
            targetId = sid;
            break;
          }
        }
      }

      if (!targetId) return;

      set((state) => {
        const currentShape = state.shapes[targetId!];
        if (!currentShape || currentShape.isClosed || currentShape.vertexIds.length < 3) {
          return {};
        }

        const nextShapes = {
          ...state.shapes,
          [targetId!]: { ...currentShape, isClosed: true },
        } satisfies Record<string, Shape>;

        return {
          shapes: nextShapes,
          activeShapeId: null,
          pendingPoints: [],
          selection: {
            shapeIds: [],
            vertexIds: [],
          },
          totals: createTotals(
            state.shapeOrder,
            nextShapes,
            state.vertices,
            state.calibration.mmPerPixel,
            state.ratePerSqm,
            state.extras
          ),
        };
      });
      // Ensure arrangement gets an item for the newly-closed shape
      get().actions.ensureArrangementForClosedShapes();
    },
    undoLastPoint: () => {
      const { activeShapeId, shapes } = get();

      // If no active shape, attempt to reopen last closed shape
      if (!activeShapeId) {
        const state = get();
        if (state.shapeOrder.length === 0) {
          return;
        }
        const lastShapeId = state.shapeOrder[state.shapeOrder.length - 1];
        const lastShape = state.shapes[lastShapeId];
        if (!lastShape) {
          return;
        }

        if (lastShape.isClosed) {
          const nextShapes = {
            ...state.shapes,
            [lastShapeId]: { ...lastShape, isClosed: false },
          } satisfies Record<string, Shape>;

          const totals = createTotals(
            state.shapeOrder,
            nextShapes,
            state.vertices,
            state.calibration.mmPerPixel,
            state.ratePerSqm,
            state.extras
          );

          set({
            activeShapeId: lastShapeId,
            shapes: nextShapes,
            selection: {
              shapeIds: [lastShapeId],
              vertexIds: nextShapes[lastShapeId].vertexIds,
            },
            totals,
          });
        }
        return;
      }

      const shape = shapes[activeShapeId];
      if (!shape) {
        return;
      }

      set((state) => {
        const currentShape = state.shapes[activeShapeId];
        if (!currentShape) {
          return {};
        }

        const updatedVertexIds = currentShape.vertexIds.slice(0, -1);

        const nextShapes = {
          ...state.shapes,
          [activeShapeId]: {
            ...currentShape,
            vertexIds: updatedVertexIds,
          },
        } satisfies Record<string, Shape>;

        const nextVertices = { ...state.vertices } satisfies Record<string, Vertex>;
        const removedVertexId = currentShape.vertexIds[currentShape.vertexIds.length - 1];
        if (removedVertexId) {
          delete nextVertices[removedVertexId];
        }

        let nextState: Partial<QuoteStoreState> = {
          shapes: nextShapes,
          vertices: nextVertices,
        };

        if (updatedVertexIds.length === 0) {
          const nextShapeOrder = state.shapeOrder.filter((id) => id !== activeShapeId);
          const { [activeShapeId]: _removed, ...restShapes } = nextShapes;

          nextState = {
            shapeOrder: nextShapeOrder,
            shapes: restShapes,
            vertices: nextVertices,
            activeShapeId: null,
            selection: {
              shapeIds: [],
              vertexIds: [],
            },
          };

          const totals = createTotals(
            nextShapeOrder,
            restShapes,
            nextVertices,
            state.calibration.mmPerPixel,
            state.ratePerSqm,
            state.extras
          );

          return {
            ...nextState,
            totals,
          };
        }

        const totals = createTotals(
          state.shapeOrder,
          nextShapes,
          nextVertices,
          state.calibration.mmPerPixel,
          state.ratePerSqm,
          state.extras
        );

        return {
          ...nextState,
          selection: {
            shapeIds: updatedVertexIds.length ? [activeShapeId] : [],
            vertexIds: updatedVertexIds,
          },
          totals,
        };
      });
    },
    setHoverPreview: (point) => {
      if (!point) {
        set({ pendingPoints: [] });
        return;
      }
      set({ pendingPoints: [point] });
    },
    setRatePerSqm: (value) => {
      set((state) => ({
        ratePerSqm: value,
        totals: createTotals(
          state.shapeOrder,
          state.shapes,
          state.vertices,
          state.calibration.mmPerPixel,
          value,
          state.extras
        ),
      }));
    },
    toggleOverlay: (key) => {
      set((state) => {
        if (key === "snapMode") {
          const nextMode =
            state.overlays.snapMode === "off"
              ? "90_45"
              : state.overlays.snapMode === "90_45"
                ? "90"
                : "off";

          return {
            overlays: {
              ...state.overlays,
              snapMode: nextMode,
            },
          };
        }

        const typedKey = key as Exclude<keyof QuoteStoreState["overlays"], "snapMode">;
        return {
          overlays: {
            ...state.overlays,
            [typedKey]: !state.overlays[typedKey],
          },
        };
      });
    },
    moveVertex: (shapeId, vertexIndex, point) => {
      set((state) => {
        const shape = state.shapes[shapeId];
        if (!shape) return {};
        const vid = shape.vertexIds[vertexIndex];
        const v = vid ? state.vertices[vid] : undefined;
        if (!vid || !v) return {};

        const nextVertices = {
          ...state.vertices,
          [vid]: { ...v, x: point.x, y: point.y },
        } satisfies Record<string, Vertex>;

        return {
          vertices: nextVertices,
          selection: {
            shapeIds: state.selection.shapeIds,
            vertexIds: state.selection.vertexIds,
          },
          totals: createTotals(
            state.shapeOrder,
            state.shapes,
            nextVertices,
            state.calibration.mmPerPixel,
            state.ratePerSqm,
            state.extras
          ),
        };
      });
    },
    moveShapePoints: (shapeId, points) => {
      set((state) => {
        const shape = state.shapes[shapeId];
        if (!shape || points.length !== shape.vertexIds.length) return {};
        const nextVertices: Record<string, Vertex> = { ...state.vertices };
        shape.vertexIds.forEach((vid, i) => {
          const v = nextVertices[vid];
          if (v) nextVertices[vid] = { ...v, x: points[i].x, y: points[i].y };
        });

        return {
          vertices: nextVertices,
          selection: {
            shapeIds: state.selection.shapeIds,
            vertexIds: state.selection.vertexIds,
          },
          totals: createTotals(
            state.shapeOrder,
            state.shapes,
            nextVertices,
            state.calibration.mmPerPixel,
            state.ratePerSqm,
            state.extras
          ),
        };
      });
    },
    ensureArrangementForClosedShapes: () => {
      set((state) => {
        const next = { ...state.arrangement } as Record<string, { points: Vec2[]; x: number; y: number }>;
        let changed = false;
        state.shapeOrder.forEach((sid, idx) => {
          const sh = state.shapes[sid];
          if (!sh || !sh.isClosed) return;
          if (!next[sid]) {
            const pts = sh.vertexIds
              .map((vid) => state.vertices[vid])
              .filter(Boolean)
              .map((v) => ({ x: v!.x, y: v!.y }));
            next[sid] = { points: pts, x: 20 + idx * 24, y: 20 + idx * 18 };
            changed = true;
          }
        });
        return changed ? { arrangement: next } : {};
      });
    },
    moveArrangementItem: (shapeId, x, y) => {
      set((state) => {
        const item = state.arrangement[shapeId];
        if (!item) return {};
        return { arrangement: { ...state.arrangement, [shapeId]: { ...item, x, y } } };
      });
    },
    setTool: (tool, subMode = null) => {
      set({
        currentTool: {
          mode: tool,
          subMode,
        },
      });
    },
    selectShape: (shapeId, options) => {
      const { append, toggle } = options ?? {};
      set((state) => {
        const exists = state.shapes[shapeId];
        if (!exists) return {};
        if (toggle) {
          const isSelected = state.selection.shapeIds.includes(shapeId);
          const nextShapeIds = isSelected
            ? state.selection.shapeIds.filter((id) => id !== shapeId)
            : [...state.selection.shapeIds, shapeId];
          return {
            selection: {
              shapeIds: nextShapeIds,
              vertexIds: [],
            },
          };
        }

        if (append) {
          if (state.selection.shapeIds.includes(shapeId)) {
            return {};
          }
          return {
            selection: {
              shapeIds: [...state.selection.shapeIds, shapeId],
              vertexIds: [],
            },
          };
        }

        return {
          selection: {
            shapeIds: [shapeId],
            vertexIds: [],
          },
        };
      });
    },
    selectShapes: (shapeIds) => {
      set(() => ({
        selection: {
          shapeIds: [...new Set(shapeIds)],
          vertexIds: [],
        },
      }));
    },
    clearSelection: () => {
      set({
        selection: {
          shapeIds: [],
          vertexIds: [],
        },
      });
    },
    groupSelectedShapes: () => {
      const state = get();
      const ids = state.selection.shapeIds;
      if (ids.length < 2) {
        return;
      }
      const groupId = randomId();
      const nextShapes: Record<string, Shape> = { ...state.shapes };
      ids.forEach((sid) => {
        const shape = nextShapes[sid];
        if (shape) {
          nextShapes[sid] = { ...shape, groupId };
        }
      });
      const nextGroups = {
        ...state.groups,
        [groupId]: { id: groupId, shapeIds: [...ids] },
      } satisfies Record<string, { id: string; shapeIds: string[] }>;
      set({
        shapes: nextShapes,
        groups: nextGroups,
        selection: {
          shapeIds: ids,
          vertexIds: [],
        },
      });
    },
    ungroupSelectedShapes: () => {
      const state = get();
      const ids = state.selection.shapeIds;
      if (ids.length === 0) return;
      const nextShapes: Record<string, Shape> = { ...state.shapes };
      const nextGroups = { ...state.groups } as Record<string, { id: string; shapeIds: string[] }>;
      const affectedGroups = new Set<string>();
      ids.forEach((sid) => {
        const shape = nextShapes[sid];
        if (shape?.groupId) {
          affectedGroups.add(shape.groupId);
          nextShapes[sid] = { ...shape, groupId: null };
        }
      });

      affectedGroups.forEach((gid) => {
        const group = nextGroups[gid];
        if (!group) return;
        const remaining = group.shapeIds.filter((sid) => !ids.includes(sid));
        if (remaining.length <= 1) {
          delete nextGroups[gid];
          if (remaining.length === 1) {
            const sid = remaining[0];
            const shape = nextShapes[sid];
            if (shape) nextShapes[sid] = { ...shape, groupId: null };
          }
        } else {
          nextGroups[gid] = { ...group, shapeIds: remaining };
        }
      });

      set({
        shapes: nextShapes,
        groups: nextGroups,
      });
    },
    deleteSelectedShapes: () => {
      const state = get();
      const ids = state.selection.shapeIds;
      if (ids.length === 0) return;
      set((prev) => {
        const nextShapes: Record<string, Shape> = { ...prev.shapes };
        const nextVertices: Record<string, Vertex> = { ...prev.vertices };
        const nextArrangement: Record<string, { points: Vec2[]; x: number; y: number }> = {
          ...prev.arrangement,
        };
        const nextGroups = { ...prev.groups } as Record<string, { id: string; shapeIds: string[] }>;

        ids.forEach((sid) => {
          const shape = nextShapes[sid];
          if (!shape) return;
          shape.vertexIds.forEach((vid) => {
            delete nextVertices[vid];
          });
          if (shape.groupId && nextGroups[shape.groupId]) {
            const group = nextGroups[shape.groupId];
            const remaining = group.shapeIds.filter((id) => id !== sid);
            if (remaining.length <= 1) {
              delete nextGroups[shape.groupId];
              if (remaining.length === 1) {
                const lone = remaining[0];
                if (nextShapes[lone]) {
                  nextShapes[lone] = { ...nextShapes[lone], groupId: null };
                }
              }
            } else {
              nextGroups[shape.groupId] = { ...group, shapeIds: remaining };
            }
          }
          delete nextShapes[sid];
          delete nextArrangement[sid];
        });

        const nextShapeOrder = prev.shapeOrder.filter((sid) => !ids.includes(sid));

        return {
          shapes: nextShapes,
          vertices: nextVertices,
          shapeOrder: nextShapeOrder,
          arrangement: nextArrangement,
          groups: nextGroups,
          activeShapeId: prev.activeShapeId && ids.includes(prev.activeShapeId) ? null : prev.activeShapeId,
          selection: { shapeIds: [], vertexIds: [] },
          totals: createTotals(
            nextShapeOrder,
            nextShapes,
            nextVertices,
            prev.calibration.mmPerPixel,
            prev.ratePerSqm,
            prev.extras
          ),
        };
      });
    },
    clearAllShapes: () => {
      set((state) => ({
        shapeOrder: [],
        shapes: {},
        vertices: {},
        arrangement: {},
        groups: {},
        activeShapeId: null,
        pendingPoints: [],
        selection: { shapeIds: [], vertexIds: [] },
        totals: createTotals([], {}, {}, state.calibration.mmPerPixel, state.ratePerSqm, state.extras),
      }));
    },
    lockSelectedShapes: (locked) => {
      const ids = get().selection.shapeIds;
      if (ids.length === 0) return;
      set((state) => {
        const nextShapes: Record<string, Shape> = { ...state.shapes };
        ids.forEach((sid) => {
          const shape = nextShapes[sid];
          if (shape) {
            nextShapes[sid] = { ...shape, locked };
          }
        });
        return { shapes: nextShapes };
      });
    },
    setGridDensity: (density) => {
      set((state) => ({
        overlays: {
          ...state.overlays,
          gridDensity: density,
        },
      }));
    },
    toggleSafeMargins: () => {
      set((state) => ({
        overlays: {
          ...state.overlays,
          showSafeMargins: !state.overlays.showSafeMargins,
        },
      }));
    },
    setSafeMarginMm: (mm) => {
      set((state) => ({
        calibration: {
          ...state.calibration,
          safeMarginMm: Math.max(0, mm),
        },
      }));
    },
    beginCalibration: () => {
      set((state) => ({
        calibration: {
          ...state.calibration,
          mode: "await_first",
          firstPoint: null,
        },
      }));
    },
    cancelCalibration: () => {
      set((state) => ({
        calibration: {
          ...state.calibration,
          mode: "idle",
          firstPoint: null,
        },
      }));
    },
    setCalibrationFirstPoint: (point) => {
      set((state) => {
        if (state.calibration.mode !== "await_first") {
          return {};
        }
        return {
          calibration: {
            ...state.calibration,
            firstPoint: point,
            mode: "await_second",
          },
        };
      });
    },
    finalizeCalibration: (mmPerPixel) => {
      set((state) => {
        const clamped = Number.isFinite(mmPerPixel) && mmPerPixel > 0 ? mmPerPixel : state.calibration.mmPerPixel;
        const calibration = {
          ...state.calibration,
          mmPerPixel: clamped ?? state.calibration.mmPerPixel,
          mode: "idle",
          firstPoint: null,
        };
        return {
          calibration,
          totals: createTotals(
            state.shapeOrder,
            state.shapes,
            state.vertices,
            calibration.mmPerPixel,
            state.ratePerSqm,
            state.extras
          ),
        };
      });
    },
    setUnits: (units) => {
      set({ units });
    },
    setPrecision: (precision) => {
      set({ precision: Math.max(0, Math.min(6, precision)) });
    },
  },
}));

export const quoteStoreSelectors = {
  shapes: (state: QuoteStoreState) => state.shapes,
  shapeOrder: (state: QuoteStoreState) => state.shapeOrder,
  vertices: (state: QuoteStoreState) => state.vertices,
  activeShapeId: (state: QuoteStoreState) => state.activeShapeId,
  pendingPoints: (state: QuoteStoreState) => state.pendingPoints,
  selection: (state: QuoteStoreState) => state.selection,
  groups: (state: QuoteStoreState) => state.groups,
  currentTool: (state: QuoteStoreState) => state.currentTool,
  overlays: (state: QuoteStoreState) => state.overlays,
  totals: (state: QuoteStoreState) => state.totals,
  ratePerSqm: (state: QuoteStoreState) => state.ratePerSqm,
  calibration: (state: QuoteStoreState) => state.calibration,
  units: (state: QuoteStoreState) => state.units,
  precision: (state: QuoteStoreState) => state.precision,
  actions: (state: QuoteStoreState) => state.actions,
};