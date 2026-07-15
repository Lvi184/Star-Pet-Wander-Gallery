import { Point, Vector, PathNode } from './types';

export function distance(a: Point, b: Point): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function manhattanDistance(a: Point, b: Point): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function pointsEqual(a: Point, b: Point): boolean {
  return Math.floor(a.x) === Math.floor(b.x) && Math.floor(a.y) === Math.floor(b.y);
}

export function normalize(v: Vector): Vector | null {
  const len = Math.sqrt(v.dx * v.dx + v.dy * v.dy);
  if (len < 0.0001) return null;
  return { dx: v.dx / len, dy: v.dy / len };
}

export function vector(from: Point, to: Point): Vector {
  return { dx: to.x - from.x, dy: to.y - from.y };
}

export function compressPath(densePath: PathNode[]): PathNode[] {
  if (densePath.length <= 1) return densePath;
  
  const compressed: PathNode[] = [densePath[0]];
  let last = densePath[0];
  
  for (let i = 1; i < densePath.length; i++) {
    const current = densePath[i];
    const prevToCurrent = { dx: current.position.x - last.position.x, dy: current.position.y - last.position.y };
    const firstToCurrent = { dx: current.position.x - compressed[0].position.x, dy: current.position.y - compressed[0].position.y };
    
    if (prevToCurrent.dx !== firstToCurrent.dx || prevToCurrent.dy !== firstToCurrent.dy) {
      compressed.push(last);
    }
    last = current;
  }
  
  if (compressed[compressed.length - 1] !== last) {
    compressed.push(last);
  }
  
  return compressed;
}

export function pathPosition(path: PathNode[], now: number): { position: Point; facing: Vector; velocity: number } | null {
  if (path.length === 0) return null;
  if (path.length === 1) {
    return { position: path[0].position, facing: path[0].facing, velocity: 0 };
  }
  
  let i = 0;
  while (i + 1 < path.length && path[i + 1].t <= now) {
    i++;
  }
  
  if (i + 1 >= path.length) {
    return { position: path[path.length - 1].position, facing: path[path.length - 1].facing, velocity: 0 };
  }
  
  const p0 = path[i];
  const p1 = path[i + 1];
  
  if (p1.t === p0.t) {
    return { position: p1.position, facing: p1.facing, velocity: 0 };
  }
  
  const alpha = (now - p0.t) / (p1.t - p0.t);
  const position: Point = {
    x: p0.position.x + (p1.position.x - p0.position.x) * alpha,
    y: p0.position.y + (p1.position.y - p0.position.y) * alpha,
  };
  
  const velocity = distance(p0.position, p1.position) / ((p1.t - p0.t) / 1000);
  
  return { position, facing: p1.facing, velocity };
}

export function orientationDegrees(vector: Vector): number {
  const EPSILON = 0.0001;
  if (Math.sqrt(vector.dx * vector.dx + vector.dy * vector.dy) < EPSILON) {
    throw new Error(`Can't compute the orientation of too small vector ${JSON.stringify(vector)}`);
  }
  const twoPi = 2 * Math.PI;
  const radians = (Math.atan2(vector.dy, vector.dx) + twoPi) % twoPi;
  return (radians / twoPi) * 360;
}