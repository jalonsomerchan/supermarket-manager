const key = (x, y) => `${x},${y}`;

const neighbors = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 }
];

export function findPath(start, goal, passable, cols, rows) {
  const startKey = key(start.x, start.y);
  const goalKey = key(goal.x, goal.y);
  const frontier = [start];
  const cameFrom = new Map([[startKey, null]]);

  while (frontier.length) {
    frontier.sort((a, b) => score(a, goal) - score(b, goal));
    const current = frontier.shift();
    const currentKey = key(current.x, current.y);
    if (currentKey === goalKey) break;

    for (const dir of neighbors) {
      const next = { x: current.x + dir.x, y: current.y + dir.y };
      const nextKey = key(next.x, next.y);
      if (next.x < 0 || next.y < 0 || next.x >= cols || next.y >= rows) continue;
      if (!passable(next) && nextKey !== goalKey) continue;
      if (cameFrom.has(nextKey)) continue;
      cameFrom.set(nextKey, current);
      frontier.push(next);
    }
  }

  if (!cameFrom.has(goalKey)) return [];
  const path = [];
  let current = goal;
  while (current) {
    path.unshift(current);
    current = cameFrom.get(key(current.x, current.y));
  }
  return path.slice(1);
}

const score = (tile, goal) => Math.abs(tile.x - goal.x) + Math.abs(tile.y - goal.y);

