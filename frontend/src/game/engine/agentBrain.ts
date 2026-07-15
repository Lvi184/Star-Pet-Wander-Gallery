import { Player, WorldMap, Point } from './types';
import { blockedWithPositions } from './movement';

const ACTIVITIES = [
  { description: 'reading a book', emoji: '📖', duration: 60000 },
  { description: 'daydreaming', emoji: '🤔', duration: 60000 },
  { description: 'gardening', emoji: '🥕', duration: 60000 },
  { description: 'walking around', emoji: '🚶', duration: 30000 },
  { description: 'looking at the sky', emoji: '☁️', duration: 45000 },
];

const STATE_ACTIVITIES = [
  { description: 'sleeping', emoji: '😴', duration: 80000 },
  { description: 'happy and purring', emoji: '😸', duration: 40000 },
  { description: 'scared of something', emoji: '😱', duration: 20000 },
];

const AGENT_WAKEUP_THRESHOLD = 3000;
const ACTIVITY_COOLDOWN = 10000;
const CONVERSATION_COOLDOWN = 15000;

interface AgentState {
  lastActionTime: number;
  lastConversationTime?: number;
  lastActivityTime?: number;
}

const agentStates = new Map<string, AgentState>();

function getAgentState(playerId: string): AgentState {
  let state = agentStates.get(playerId);
  if (!state) {
    state = { lastActionTime: 0 };
    agentStates.set(playerId, state);
  }
  return state;
}

export function wanderDestination(worldMap: WorldMap): Point {
  return {
    x: 1 + Math.floor(Math.random() * (worldMap.width - 2)),
    y: 1 + Math.floor(Math.random() * (worldMap.height - 2)),
  };
}

function findValidWanderDestination(worldMap: WorldMap, otherPositions: Point[]): Point | null {
  for (let attempts = 0; attempts < 20; attempts++) {
    const destination = wanderDestination(worldMap);
    if (!blockedWithPositions(destination, otherPositions, worldMap)) {
      return destination;
    }
  }
  return null;
}

export function tickAgent(
  player: Player,
  worldMap: WorldMap,
  otherPlayers: Player[],
  now: number
): { destination?: Point; activity?: { description: string; emoji: string; until: number } } | null {
  const state = getAgentState(player.id);

  if (player.human) {
    return null;
  }

  if (player.pathfinding) {
    return null;
  }

  if (player.activity && player.activity.until > now) {
    return null;
  }

  const inConversation = otherPlayers.some((p) => {
    return p.activity?.description === 'talking' && 
           Math.abs(p.position.x - player.position.x) < 2 && 
           Math.abs(p.position.y - player.position.y) < 2;
  });

  if (inConversation) {
    return null;
  }

  if (now < state.lastActionTime + AGENT_WAKEUP_THRESHOLD) {
    return null;
  }

  state.lastActionTime = now;

  const justLeftConversation =
    state.lastConversationTime && now < state.lastConversationTime + CONVERSATION_COOLDOWN;
  const recentActivity = state.lastActivityTime && now < state.lastActivityTime + ACTIVITY_COOLDOWN;

  if (recentActivity || justLeftConversation) {
    const otherPositions = otherPlayers.map((p) => p.position);
    const destination = findValidWanderDestination(worldMap, otherPositions);
    if (destination) {
      return { destination };
    }
    return null;
  }

  const rand = Math.random();
  
  if (rand < 0.5) {
    const otherPositions = otherPlayers.map((p) => p.position);
    const destination = findValidWanderDestination(worldMap, otherPositions);
    if (destination) {
      return { destination };
    }
  }

  if (rand < 0.85) {
    const activity = ACTIVITIES[Math.floor(Math.random() * ACTIVITIES.length)];
    state.lastActivityTime = now;
    
    return {
      activity: {
        description: activity.description,
        emoji: activity.emoji,
        until: now + activity.duration,
      },
    };
  }

  const stateActivity = STATE_ACTIVITIES[Math.floor(Math.random() * STATE_ACTIVITIES.length)];
  state.lastActivityTime = now;
  
  return {
    activity: {
      description: stateActivity.description,
      emoji: stateActivity.emoji,
      until: now + stateActivity.duration,
    },
  };
}