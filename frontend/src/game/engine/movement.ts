import { Player, Point, Vector, Path, WorldMap } from './types';
import { distance, manhattanDistance, pointsEqual, compressPath, pathPosition } from './geometry';

interface PathCandidate {
  position: Point;
  facing?: Vector;
  t: number;
  length: number;
  cost: number;
  prev?: PathCandidate;
}

const COLLISION_THRESHOLD = 0.5;
const PATHFINDING_TIMEOUT = 10000;
const PATHFINDING_BACKOFF = 1000;
const movementSpeed = 0.75;

export function stopPlayer(player: Player): Player {
  return { ...player, pathfinding: undefined, speed: 0 };
}

export function movePlayer(game: GameState, now: number, player: Player, destination: Point, allowInConversation?: boolean): Player {
  if (Math.floor(destination.x) !== destination.x || Math.floor(destination.y) !== destination.y) {
    throw new Error(`Non-integral destination: ${JSON.stringify(destination)}`);
  }
  const { position } = player;
  if (pointsEqual(position, destination)) {
    return player;
  }
  const inConversation = [...game.conversations.values()].some((c) => c.participants.get(player.id)?.status.kind === 'participating');
  if (inConversation && !allowInConversation) {
    throw new Error(`Can't move when in a conversation. Leave the conversation first!`);
  }
  return {
    ...player,
    pathfinding: {
      destination: { ...destination },
      started: now,
      state: { kind: 'needsPath' },
    },
  };
}

interface GameState {
  conversations: Map<string, any>;
  worldMap: WorldMap;
  players: Map<string, Player>;
}

export function findRoute(game: GameState, now: number, player: Player, destination: Point): {
  path: Path;
  newDestination?: Point;
} | null {
  const minDistances: PathCandidate[][] = [];
  const explore = (current: PathCandidate): Array<PathCandidate> => {
    const { x, y } = current.position;
    const neighbors = [];

    if (x !== Math.floor(x)) {
      neighbors.push(
        { position: { x: Math.floor(x), y }, facing: { dx: -1, dy: 0 } },
        { position: { x: Math.floor(x) + 1, y }, facing: { dx: 1, dy: 0 } },
      );
    }
    if (y !== Math.floor(y)) {
      neighbors.push(
        { position: { x, y: Math.floor(y) }, facing: { dx: 0, dy: -1 } },
        { position: { x, y: Math.floor(y) + 1 }, facing: { dx: 0, dy: 1 } },
      );
    }
    if (x == Math.floor(x) && y == Math.floor(y)) {
      neighbors.push(
        { position: { x: x + 1, y }, facing: { dx: 1, dy: 0 } },
        { position: { x: x - 1, y }, facing: { dx: -1, dy: 0 } },
        { position: { x, y: y + 1 }, facing: { dx: 0, dy: 1 } },
        { position: { x, y: y - 1 }, facing: { dx: 0, dy: -1 } },
      );
    }

    const next = [];
    for (const { position, facing } of neighbors) {
      const segmentLength = distance(current.position, position);
      const length = current.length + segmentLength;
      if (blocked(game, now, position, player.id)) {
        continue;
      }
      const remaining = manhattanDistance(position, destination);
      const path = {
        position,
        facing,
        t: current.t + (segmentLength / movementSpeed) * 1000,
        length,
        cost: length + remaining,
        prev: current,
      };
      const existingMin = minDistances[position.y]?.[position.x];
      if (existingMin && existingMin.cost <= path.cost) {
        continue;
      }
      minDistances[position.y] ??= [];
      minDistances[position.y][position.x] = path;
      next.push(path);
    }
    return next;
  };

  const startingLocation = player.position;
  const startingPosition = { x: startingLocation.x, y: startingLocation.y };
  let current: PathCandidate | undefined = {
    position: startingPosition,
    facing: player.facing,
    t: now,
    length: 0,
    cost: manhattanDistance(startingPosition, destination),
    prev: undefined,
  };
  let bestCandidate = current;

  const heap: PathCandidate[] = [];
  const push = (p: PathCandidate) => {
    heap.push(p);
    let i = heap.length - 1;
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (heap[parent].cost <= heap[i].cost) break;
      [heap[i], heap[parent]] = [heap[parent], heap[i]];
      i = parent;
    }
  };
  const pop = (): PathCandidate | undefined => {
    if (heap.length === 0) return undefined;
    const top = heap[0];
    const last = heap.pop()!;
    if (heap.length > 0) {
      heap[0] = last;
      let i = 0;
      while (true) {
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        let smallest = i;
        if (left < heap.length && heap[left].cost < heap[smallest].cost) smallest = left;
        if (right < heap.length && heap[right].cost < heap[smallest].cost) smallest = right;
        if (smallest === i) break;
        [heap[i], heap[smallest]] = [heap[smallest], heap[i]];
        i = smallest;
      }
    }
    return top;
  };

  while (current) {
    if (pointsEqual(current.position, destination)) {
      break;
    }
    if (manhattanDistance(current.position, destination) < manhattanDistance(bestCandidate.position, destination)) {
      bestCandidate = current;
    }
    for (const candidate of explore(current)) {
      push(candidate);
    }
    current = pop();
  }

  let newDestination = null;
  if (!current) {
    if (bestCandidate.length === 0) {
      return null;
    }
    current = bestCandidate;
    newDestination = current.position;
  }

  const densePath: Path = [];
  let facing = current.facing!;
  while (current) {
    densePath.push({ position: { ...current.position }, t: current.t, facing: { ...facing } });
    facing = current.facing!;
    current = current.prev;
  }
  densePath.reverse();

  return { path: compressPath(densePath), newDestination };
}

export function blocked(game: GameState, now: number, pos: Point, playerId?: string): string | null {
  const otherPositions = [...game.players.values()]
    .filter((p) => p.id !== playerId)
    .map((p) => p.position);
  return blockedWithPositions(pos, otherPositions, game.worldMap);
}

export function blockedWithPositions(position: Point, otherPositions: Point[], map: WorldMap): string | null {
  if (isNaN(position.x) || isNaN(position.y)) {
    throw new Error(`NaN position in ${JSON.stringify(position)}`);
  }
  if (position.x < 0 || position.y < 0 || position.x >= map.width || position.y >= map.height) {
    return 'out of bounds';
  }
  for (const layer of map.objectTiles) {
    const col = layer[Math.floor(position.x)];
    if (col !== undefined && col[Math.floor(position.y)] !== -1) {
      return 'world blocked';
    }
  }
  for (const otherPosition of otherPositions) {
    if (distance(otherPosition, position) < COLLISION_THRESHOLD) {
      return 'player';
    }
  }
  return null;
}

export function tickPathfinding(game: GameState, now: number, player: Player): Player {
  const { pathfinding, position } = player;
  if (!pathfinding) {
    return player;
  }

  if (pathfinding.state.kind === 'moving' && pointsEqual(pathfinding.destination, position)) {
    return stopPlayer(player);
  }

  if (pathfinding.started + PATHFINDING_TIMEOUT < now) {
    console.warn(`Timing out pathfinding for ${player.id}`);
    return stopPlayer(player);
  }

  let newState = pathfinding.state;
  if (pathfinding.state.kind === 'waiting' && pathfinding.state.until < now) {
    newState = { kind: 'needsPath' };
  }

  if (newState.kind === 'needsPath') {
    const route = findRoute(game, now, player, pathfinding.destination);
    if (route === null) {
      console.log(`Failed to route to ${JSON.stringify(pathfinding.destination)}`);
      return stopPlayer(player);
    } else {
      const newDestination = route.newDestination || pathfinding.destination;
      return {
        ...player,
        pathfinding: {
          ...pathfinding,
          destination: { ...newDestination },
          state: { kind: 'moving', path: route.path },
        },
      };
    }
  }

  return { ...player, pathfinding: { ...pathfinding, state: newState } };
}

export function tickPosition(game: GameState, now: number, player: Player): Player {
  if (!player.pathfinding || player.pathfinding.state.kind !== 'moving') {
    return { ...player, speed: 0 };
  }

  const candidate = pathPosition(player.pathfinding.state.path, now);
  if (!candidate) {
    console.warn(`Path out of range of ${now} for ${player.id}`);
    return player;
  }

  const { position, facing, velocity } = candidate;
  const collisionReason = blocked(game, now, position, player.id);
  
  if (collisionReason !== null) {
    const backoff = Math.random() * PATHFINDING_BACKOFF;
    console.warn(`Stopping path for ${player.id}, waiting for ${backoff}ms: ${collisionReason}`);
    return {
      ...player,
      pathfinding: {
        ...player.pathfinding,
        state: { kind: 'waiting', until: now + backoff },
      },
    };
  }

  return {
    ...player,
    position: { ...position },
    facing: { ...facing },
    speed: velocity,
  };
}