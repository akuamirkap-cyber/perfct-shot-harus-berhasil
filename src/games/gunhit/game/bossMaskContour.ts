type Edge = { end: number; direction: number };

/** Trace exact pixel boundaries into compact closed polygons for fast clipping. */
export function traceSolidContours(solid: Uint8Array, size: number): number[][] | null {
  if (size <= 0 || solid.length < size * size) return null;
  const stride = size + 1;
  const edges = new Map<number, Edge[]>();
  let edgeCount = 0;
  const add = (x: number, y: number, dx: number, dy: number, direction: number) => {
    const from = y * stride + x;
    const edge = { end: (y + dy) * stride + x + dx, direction };
    const list = edges.get(from);
    if (list) list.push(edge);
    else edges.set(from, [edge]);
    edgeCount++;
  };
  const at = (x: number, y: number) => x >= 0 && y >= 0 && x < size && y < size && solid[y * size + x] !== 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!at(x, y)) continue;
      if (!at(x, y - 1)) add(x, y, 1, 0, 0);
      if (!at(x + 1, y)) add(x + 1, y, 0, 1, 1);
      if (!at(x, y + 1)) add(x + 1, y + 1, -1, 0, 2);
      if (!at(x - 1, y)) add(x, y + 1, 0, -1, 3);
    }
  }

  const contours: number[][] = [];
  let used = 0;
  while (edges.size) {
    const start = edges.keys().next().value as number;
    const points = [start % stride, Math.floor(start / stride)];
    let vertex = start;
    let previousDirection = -1;
    do {
      const choices = edges.get(vertex);
      if (!choices?.length || used++ > edgeCount) return null;
      let chosen = 0;
      if (previousDirection >= 0 && choices.length > 1) {
        const priority = [1, 0, 3, 2]; // right, straight, left, back
        for (const turn of priority) {
          const index = choices.findIndex((edge) => (edge.direction - previousDirection + 4) % 4 === turn);
          if (index >= 0) { chosen = index; break; }
        }
      }
      const [edge] = choices.splice(chosen, 1);
      if (!choices.length) edges.delete(vertex);
      if (previousDirection >= 0 && edge.direction !== previousDirection) {
        points.push(vertex % stride, Math.floor(vertex / stride));
      }
      previousDirection = edge.direction;
      vertex = edge.end;
    } while (vertex !== start);
    contours.push(points);
  }
  return contours;
}