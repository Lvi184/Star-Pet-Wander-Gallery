export interface Point {
  x: number;
  y: number;
}

export interface Vector {
  dx: number;
  dy: number;
}

export interface PathNode {
  position: Point;
  t: number;
  facing: Vector;
}

export type Path = PathNode[];

export type PathfindingState =
  | { kind: 'needsPath' }
  | { kind: 'waiting'; until: number }
  | { kind: 'moving'; path: Path };

export interface Pathfinding {
  destination: Point;
  started: number;
  state: PathfindingState;
}

export interface Activity {
  description: string;
  emoji?: string;
  until: number;
}

export interface Player {
  id: string;
  human?: string;
  pathfinding?: Pathfinding;
  activity?: Activity;
  lastInput: number;
  position: Point;
  facing: Vector;
  speed: number;
}

export type ConversationStatus =
  | { kind: 'invited' }
  | { kind: 'walkingOver' }
  | { kind: 'participating'; started: number };

export interface ConversationMembership {
  playerId: string;
  invited: number;
  status: ConversationStatus;
}

export interface TypingIndicator {
  playerId: string;
  messageUuid: string;
  since: number;
}

export interface LastMessage {
  author: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  creator: string;
  created: number;
  isTyping?: TypingIndicator;
  lastMessage?: LastMessage;
  numMessages: number;
  participants: Map<string, ConversationMembership>;
}

export interface Message {
  id: string;
  conversationId: string;
  author: string;
  authorName: string;
  text: string;
  timestamp: number;
  messageUuid: string;
}

export interface AnimatedSpriteData {
  x: number;
  y: number;
  w: number;
  h: number;
  layer: number;
  sheet: string;
  animation: string;
}

export interface WorldMap {
  width: number;
  height: number;
  tileSetUrl: string;
  tileSetDimX: number;
  tileSetDimY: number;
  tileDim: number;
  bgTiles: number[][][];
  objectTiles: number[][][];
  animatedSprites: AnimatedSpriteData[];
}

export interface PlayerDescription {
  playerId: string;
  character: string;
  description: string;
  name: string;
}