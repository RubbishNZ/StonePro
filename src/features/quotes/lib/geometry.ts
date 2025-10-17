export type Vec2 = {
  x: number;
  y: number;
};

export type ShapeMetrics = {
  areaSqm: number;
  perimeterMm: number;
};

const MM_PER_M = 1000;

function ensureMmPerPixel(mmPerPixel: number | null | undefined) {
  return mmPerPixel && mmPerPixel > 0 ? mmPerPixel : 1;
}

export function shoelaceArea(points: Vec2[], mmPerPixel: number | null): number {
  if (points.length < 3) {
    return 0;
  }

  const scale = ensureMmPerPixel(mmPerPixel);
  let sum = 0;

  for (let i = 0; i < points.length; i += 1) {
    const { x: x1, y: y1 } = points[i];
    const { x: x2, y: y2 } = points[(i + 1) % points.length];

    const x1Mm = x1 * scale;
    const y1Mm = y1 * scale;
    const x2Mm = x2 * scale;
    const y2Mm = y2 * scale;

    sum += x1Mm * y2Mm - x2Mm * y1Mm;
  }

  const areaSquareMm = Math.abs(sum) / 2;

  return areaSquareMm / (MM_PER_M * MM_PER_M);
}

export function perimeter(points: Vec2[], mmPerPixel: number | null): number {
  if (points.length < 2) {
    return 0;
  }

  const scale = ensureMmPerPixel(mmPerPixel);
  let total = 0;

  for (let i = 0; i < points.length; i += 1) {
    const current = points[i];
    const next = points[(i + 1) % points.length];

    const dx = (next.x - current.x) * scale;
    const dy = (next.y - current.y) * scale;

    total += Math.sqrt(dx * dx + dy * dy);
  }

  return total;
}

export function calculateShapeMetrics(
  points: Vec2[],
  mmPerPixel: number | null
): ShapeMetrics {
  if (points.length < 3) {
    return { areaSqm: 0, perimeterMm: 0 };
  }

  return {
    areaSqm: shoelaceArea(points, mmPerPixel),
    perimeterMm: perimeter(points, mmPerPixel),
  };
}

export function distance(a: Vec2, b: Vec2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}