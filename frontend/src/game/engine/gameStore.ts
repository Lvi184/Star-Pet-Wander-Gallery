import { create } from 'zustand';
import { Player, Conversation, Message, WorldMap, PlayerDescription, Point, Vector, Pathfinding } from './types';
import { gentleMapData } from '../../components/pixi/mapData';
import { characters } from '../../components/pixi/characters';

interface GameState {
  worldMap: WorldMap;
  players: Map<string, Player>;
  conversations: Map<string, Conversation>;
  messages: Map<string, Message[]>;
  playerDescriptions: Map<string, PlayerDescription>;
  selectedPlayerId: string | null;
  humanTokenIdentifier: string | null;
  
  setHumanTokenIdentifier: (token: string | null) => void;
  addPlayer: (player: Player, description: PlayerDescription) => void;
  updatePlayer: (playerId: string, updates: Partial<Player>) => void;
  removePlayer: (playerId: string) => void;
  movePlayer: (playerId: string, destination: Point) => void;
  setPathfinding: (playerId: string, pathfinding: Pathfinding | undefined) => void;
  
  createConversation: (conversation: Conversation) => void;
  updateConversation: (conversationId: string, updates: Partial<Conversation>) => void;
  removeConversation: (conversationId: string) => void;
  
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  
  setSelectedPlayerId: (playerId: string | null) => void;
  
  getHumanPlayer: () => Player | undefined;
  getPlayerConversation: (playerId: string) => Conversation | undefined;
  initDemoData: () => void;
}

const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

export const useGameStore = create<GameState>((set, get) => ({
  worldMap: gentleMapData,
  players: new Map(),
  conversations: new Map(),
  messages: new Map(),
  playerDescriptions: new Map(),
  selectedPlayerId: null,
  humanTokenIdentifier: 'human-1',
  
  setHumanTokenIdentifier: (token) => set({ humanTokenIdentifier: token }),
  
  addPlayer: (player, description) => {
    const { players, playerDescriptions } = get();
    const newPlayers = new Map(players);
    newPlayers.set(player.id, player);
    const newDescriptions = new Map(playerDescriptions);
    newDescriptions.set(player.id, description);
    set({ players: newPlayers, playerDescriptions: newDescriptions });
  },
  
  updatePlayer: (playerId, updates) => {
    const { players } = get();
    const player = players.get(playerId);
    if (!player) return;
    const newPlayers = new Map(players);
    newPlayers.set(playerId, { ...player, ...updates });
    set({ players: newPlayers });
  },
  
  removePlayer: (playerId) => {
    const { players, playerDescriptions } = get();
    const newPlayers = new Map(players);
    newPlayers.delete(playerId);
    const newDescriptions = new Map(playerDescriptions);
    newDescriptions.delete(playerId);
    set({ players: newPlayers, playerDescriptions: newDescriptions });
  },
  
  movePlayer: (playerId, destination) => {
    const { players } = get();
    const player = players.get(playerId);
    if (!player) return;
    
    const now = Date.now();
    const pathfinding: Pathfinding = {
      destination,
      started: now,
      state: { kind: 'needsPath' },
    };
    
    const newPlayers = new Map(players);
    newPlayers.set(playerId, { ...player, pathfinding });
    set({ players: newPlayers });
  },
  
  setPathfinding: (playerId, pathfinding) => {
    const { players } = get();
    const player = players.get(playerId);
    if (!player) return;
    const newPlayers = new Map(players);
    newPlayers.set(playerId, { ...player, pathfinding });
    set({ players: newPlayers });
  },
  
  createConversation: (conversation) => {
    const { conversations } = get();
    const newConversations = new Map(conversations);
    newConversations.set(conversation.id, conversation);
    set({ conversations: newConversations });
  },
  
  updateConversation: (conversationId, updates) => {
    const { conversations } = get();
    const conversation = conversations.get(conversationId);
    if (!conversation) return;
    
    const updatedParticipants = updates.participants !== undefined 
      ? updates.participants 
      : conversation.participants;
    
    const newConversations = new Map(conversations);
    newConversations.set(conversationId, { ...conversation, ...updates, participants: updatedParticipants });
    set({ conversations: newConversations });
  },
  
  removeConversation: (conversationId) => {
    const { conversations } = get();
    const newConversations = new Map(conversations);
    newConversations.delete(conversationId);
    set({ conversations: newConversations });
  },
  
  addMessage: (message) => {
    const { messages } = get();
    const newMessages = new Map(messages);
    const existing = newMessages.get(message.conversationId) || [];
    newMessages.set(message.conversationId, [...existing, message]);
    set({ messages: newMessages });
  },
  
  clearMessages: () => set({ messages: new Map() }),
  
  setSelectedPlayerId: (playerId) => set({ selectedPlayerId: playerId }),
  
  getHumanPlayer: () => {
    const { players, humanTokenIdentifier } = get();
    if (!humanTokenIdentifier) return undefined;
    return [...players.values()].find((p) => p.human === humanTokenIdentifier);
  },
  
  getPlayerConversation: (playerId) => {
    const { conversations } = get();
    return [...conversations.values()].find((c) => c.participants.has(playerId));
  },
  
  initDemoData: () => {
    const initialPlayers: Player[] = [
      {
        id: 'player-1',
        human: 'human-1',
        lastInput: Date.now(),
        position: { x: 24, y: 32 },
        facing: { dx: 0, dy: 1 },
        speed: 0,
      },
      {
        id: 'player-2',
        lastInput: Date.now(),
        position: { x: 20, y: 10 },
        facing: { dx: 0, dy: 1 },
        speed: 0,
      },
      {
        id: 'player-3',
        lastInput: Date.now(),
        position: { x: 30, y: 20 },
        facing: { dx: -1, dy: 0 },
        speed: 0,
      },
      {
        id: 'player-4',
        lastInput: Date.now(),
        position: { x: 10, y: 25 },
        facing: { dx: 0, dy: -1 },
        speed: 0,
      },
    ];
    
    const initialDescriptions: PlayerDescription[] = [
      { playerId: 'player-1', character: 'hagimi', description: '这是你的哈基咪！一只可爱的猫咪。', name: '哈基咪' },
      { playerId: 'player-2', character: 'f2', description: '一只爱冒险的小鹿，喜欢探索森林的每一个角落。', name: '小鹿' },
      { playerId: 'player-3', character: 'f3', description: '一位神秘的猫头鹰学者，知识渊博。', name: '猫头鹰博士' },
      { playerId: 'player-4', character: 'f4', description: '勤劳的松鼠，正在收集坚果。', name: '松鼠' },
    ];
    
    const { players, playerDescriptions } = get();
    const newPlayers = new Map(players);
    const newDescriptions = new Map(playerDescriptions);
    
    initialPlayers.forEach((p, i) => {
      newPlayers.set(p.id, p);
      newDescriptions.set(p.id, initialDescriptions[i]);
    });
    
    set({ players: newPlayers, playerDescriptions: newDescriptions });
  },
}));
