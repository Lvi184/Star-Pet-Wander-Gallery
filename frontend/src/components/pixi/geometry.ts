export interface Vector {
  dx: number;
  dy: number;
}

const EPSILON = 0.0001;

export function orientationDegrees(vector: Vector): number {
  if (Math.sqrt(vector.dx * vector.dx + vector.dy * vector.dy) < EPSILON) {
    throw new Error(`Can't compute the orientation of too small vector ${JSON.stringify(vector)}`);
  }
  const twoPi = 2 * Math.PI;
  const radians = (Math.atan2(vector.dy, vector.dx) + twoPi) % twoPi;
  return (radians / twoPi) * 360;
}