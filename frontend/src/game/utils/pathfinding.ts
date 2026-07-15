export interface Point {
  x: number;
  y: number;
}

export interface PathNode {
  position: Point;
  g: number;
  h: number;
  f: number;
  parent: PathNode | null;
}

const COLLISION_THRESHOLD = 0.5;

export function distance(a: Point, b: Point): number {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

export function manhattanDistance(a: Point, b: Point): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function pointsEqual(a: Point, b: Point): boolean {
  return Math.floor(a.x) === Math.floor(b.x) && Math.floor(a.y) === Math.floor(b.y);
}

export function blocked(
  map: any,
  position: Point,
  otherPositions: Point[],
  tileWidth: number,
  tileHeight: number
): string | null {
  const tileX = Math.floor(position.x / tileWidth);
  const tileY = Math.floor(position.y / tileHeight);

  if (isNaN(position.x) || isNaN(position.y)) {
    return 'NaN position';
  }

  if (tileX < 0 || tileY < 0 || tileX >= map.width || tileY >= map.height) {
    return 'out of bounds';
  }

  for (const layer of map.layers) {
    if (layer.tilemapLayer) {
      const tile = layer.tilemapLayer.getTileAt(tileX, tileY);
      if (tile && tile.properties?.collides) {
        return 'world blocked';
      }
    }
  }

  for (const otherPosition of otherPositions) {
    if (distance(otherPosition, position) < COLLISION_THRESHOLD * tileWidth) {
      return 'player';
    }
  }

  return null;
}

export function findRoute(
  map: any,
  start: Point,
  destination: Point,
  otherPositions: Point[] = [],
  tileWidth: number = 32,
  tileHeight: number = 32
): Point[] | null {
  if (pointsEqual(start, destination)) {
    return [];
  }

  const startTile: Point = { x: Math.floor(start.x / tileWidth), y: Math.floor(start.y / tileHeight) };
  const destTile: Point = { x: Math.floor(destination.x / tileWidth), y: Math.floor(destination.y / tileHeight) };

  const openList: PathNode[] = [];
  const closedList: Set<string> = new Set();

  const startNode: PathNode = {
    position: startTile,
    g: 0,
    h: manhattanDistance(startTile, destTile),
    f: manhattanDistance(startTile, destTile),
    parent: null,
  };

  openList.push(startNode);

  const getNeighbors = (pos: Point): Point[] => {
    const neighbors: Point[] = [];
    neighbors.push({ x: pos.x + 1, y: pos.y });
    neighbors.push({ x: pos.x - 1, y: pos.y });
    neighbors.push({ x: pos.x, y: pos.y + 1 });
    neighbors.push({ x: pos.x, y: pos.y - 1 });
    return neighbors;
  };

  const getNodeKey = (pos: Point): string => `${pos.x},${pos.y}`;

  while (openList.length > 0) {
    openList.sort((a, b) => a.f - b.f);
    const current = openList.shift()!;

    if (pointsEqual(current.position, destTile)) {
      const path: Point[] = [];
      let node: PathNode | null = current;
      while (node) {
        path.push({
          x: node.position.x * tileWidth + tileWidth / 2,
          y: node.position.y * tileHeight + tileHeight / 2,
        });
        node = node.parent;
      }
      return path.reverse();
    }

    closedList.add(getNodeKey(current.position));

    for (const neighbor of getNeighbors(current.position)) {
      if (closedList.has(getNodeKey(neighbor))) continue;

      const worldPos: Point = {
        x: neighbor.x * tileWidth + tileWidth / 2,
        y: neighbor.y * tileHeight + tileHeight / 2,
      };

      if (blocked(map, worldPos, otherPositions, tileWidth, tileHeight)) continue;

      const g = current.g + 1;
      const h = manhattanDistance(neighbor, destTile);
      const f = g + h;

      const existingNode = openList.find((n) => pointsEqual(n.position, neighbor));
      if (existingNode) {
        if (g < existingNode.g) {
          existingNode.g = g;
          existingNode.f = f;
          existingNode.parent = current;
        }
      } else {
        openList.push({
          position: neighbor,
          g,
          h,
          f,
          parent: current,
        });
      }
    }
  }

  return null;
}

export function compressPath(path: Point[]): Point[] {
  if (path.length <= 2) return path;

  const compressed: Point[] = [path[0]];
  let prev = path[0];
  let dirX = path[1].x - prev.x;
  let dirY = path[1].y - prev.y;

  for (let i = 2; i < path.length; i++) {
    const curr = path[i];
    const newDirX = curr.x - prev.x;
    const newDirY = curr.y - prev.y;

    if (newDirX !== dirX || newDirY !== dirY) {
      compressed.push(prev);
      dirX = newDirX;
      dirY = newDirY;
    }

    prev = curr;
  }

  compressed.push(path[path.length - 1]);
  return compressed;
}