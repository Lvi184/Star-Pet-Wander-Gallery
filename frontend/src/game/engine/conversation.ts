import { Player, Conversation, ConversationMembership, ConversationStatus, Point, Vector } from './types';
import { distance, normalize, vector } from './geometry';
import { stopPlayer, movePlayer, blockedWithPositions } from './movement';

const TYPING_TIMEOUT = 5000;
const CONVERSATION_DISTANCE = 1.5;

interface GameState {
  conversations: Map<string, Conversation>;
  worldMap: any;
  players: Map<string, Player>;
}

export function tickConversation(game: GameState, conversation: Conversation, now: number): { conversation: Conversation; updatedPlayers: Map<string, Player> } {
  let updatedConversation = { ...conversation };
  
  if (updatedConversation.isTyping && updatedConversation.isTyping.since + TYPING_TIMEOUT < now) {
    updatedConversation = { ...updatedConversation, isTyping: undefined };
  }
  
  if (updatedConversation.participants.size !== 2) {
    console.warn(`Conversation ${updatedConversation.id} has ${updatedConversation.participants.size} participants`);
    return { conversation: updatedConversation, updatedPlayers: new Map() };
  }
  
  const [playerId1, playerId2] = [...updatedConversation.participants.keys()];
  const member1 = { ...updatedConversation.participants.get(playerId1)! };
  const member2 = { ...updatedConversation.participants.get(playerId2)! };
  
  const player1 = game.players.get(playerId1)!;
  const player2 = game.players.get(playerId2)!;
  
  const updatedPlayers = new Map<string, Player>();
  
  const playerDistance = distance(player1.position, player2.position);
  
  if (member1.status.kind === 'walkingOver' && member2.status.kind === 'walkingOver') {
    if (playerDistance < CONVERSATION_DISTANCE) {
      console.log(`Starting conversation between ${player1.id} and ${player2.id}`);
      
      const stoppedPlayer1 = stopPlayer(player1);
      const stoppedPlayer2 = stopPlayer(player2);
      updatedPlayers.set(player1.id, stoppedPlayer1);
      updatedPlayers.set(player2.id, stoppedPlayer2);
      
      member1.status = { kind: 'participating', started: now };
      member2.status = { kind: 'participating', started: now };
      
      const neighbors = (p: Point) => [
        { x: p.x + 1, y: p.y },
        { x: p.x - 1, y: p.y },
        { x: p.x, y: p.y + 1 },
        { x: p.x, y: p.y - 1 },
      ];
      
      const floorPos1 = { x: Math.floor(player1.position.x), y: Math.floor(player1.position.y) };
      const otherPositions = [...game.players.values()].filter((p) => p.id !== player1.id).map((p) => p.position);
      const p1Candidates = neighbors(floorPos1).filter((p) => !blocked(game, p, player1.id, otherPositions));
      p1Candidates.sort((a, b) => distance(a, player2.position) - distance(b, player2.position));
      
      if (p1Candidates.length > 0) {
        const p1Candidate = p1Candidates[0];
        const otherPositions2 = [...game.players.values()].filter((p) => p.id !== player2.id).map((p) => p.position);
        const p2Candidates = neighbors(p1Candidate).filter((p) => !blocked(game, p, player2.id, otherPositions2));
        p2Candidates.sort((a, b) => distance(a, player2.position) - distance(b, player2.position));
        
        if (p2Candidates.length > 0) {
          const p2Candidate = p2Candidates[0];
          const movedPlayer1 = movePlayer(game, now, stoppedPlayer1, p1Candidate, true);
          const movedPlayer2 = movePlayer(game, now, stoppedPlayer2, p2Candidate, true);
          updatedPlayers.set(player1.id, movedPlayer1);
          updatedPlayers.set(player2.id, movedPlayer2);
        }
      }
    }
  }
  
  if (member1.status.kind === 'participating' && member2.status.kind === 'participating') {
    const v = normalize(vector(player1.position, player2.position));
    if (!player1.pathfinding && v) {
      updatedPlayers.set(player1.id, { ...player1, facing: v });
    }
    if (!player2.pathfinding && v) {
      updatedPlayers.set(player2.id, { ...player2, facing: { dx: -v.dx, dy: -v.dy } });
    }
  }
  
  const newParticipants = new Map<string, ConversationMembership>(updatedConversation.participants);
  newParticipants.set(playerId1, member1);
  newParticipants.set(playerId2, member2);
  
  return {
    conversation: { ...updatedConversation, participants: newParticipants },
    updatedPlayers,
  };
}

function blocked(game: GameState, pos: Point, playerId: string, otherPositions: Point[]): boolean {
  if (pos.x < 0 || pos.y < 0 || pos.x >= game.worldMap.width || pos.y >= game.worldMap.height) {
    return true;
  }
  
  for (const layer of game.worldMap.objectTiles) {
    const col = layer[Math.floor(pos.x)];
    if (col && col[Math.floor(pos.y)] !== -1) {
      return true;
    }
  }
  
  for (const otherPosition of otherPositions) {
    if (distance(otherPosition, pos) < 0.5) {
      return true;
    }
  }
  
  return false;
}

export function startConversation(game: GameState, now: number, player: Player, invitee: Player): { conversationId: string } | { error: string } {
  if (player.id === invitee.id) {
    return { error: `Can't invite yourself to a conversation` };
  }
  
  if ([...game.conversations.values()].find((c) => c.participants.has(player.id))) {
    return { error: `Player ${player.id} is already in a conversation` };
  }
  
  if ([...game.conversations.values()].find((c) => c.participants.has(invitee.id))) {
    return { error: `Player ${invitee.id} is already in a conversation` };
  }
  
  const conversationId = Math.random().toString(36).substring(2, 11);
  
  const membership1: ConversationMembership = {
    playerId: player.id,
    invited: now,
    status: { kind: 'walkingOver' },
  };
  
  const membership2: ConversationMembership = {
    playerId: invitee.id,
    invited: now,
    status: { kind: 'invited' },
  };
  
  const participants = new Map<string, ConversationMembership>();
  participants.set(player.id, membership1);
  participants.set(invitee.id, membership2);
  
  const conversation: Conversation = {
    id: conversationId,
    creator: player.id,
    created: now,
    numMessages: 0,
    participants,
  };
  
  game.conversations.set(conversationId, conversation);
  return { conversationId };
}

export function acceptInvite(game: GameState, conversation: Conversation, player: Player): Conversation {
  const member = conversation.participants.get(player.id);
  if (!member) {
    throw new Error(`Player ${player.id} not in conversation ${conversation.id}`);
  }
  if (member.status.kind !== 'invited') {
    throw new Error(`Invalid membership status for ${player.id}:${conversation.id}: ${JSON.stringify(member)}`);
  }
  
  const newParticipants = new Map<string, ConversationMembership>(conversation.participants);
  newParticipants.set(player.id, { ...member, status: { kind: 'walkingOver' } });
  
  return { ...conversation, participants: newParticipants };
}

export function rejectInvite(game: GameState, now: number, conversation: Conversation, player: Player): void {
  const member = conversation.participants.get(player.id);
  if (!member) {
    throw new Error(`Player ${player.id} not in conversation ${conversation.id}`);
  }
  if (member.status.kind !== 'invited') {
    throw new Error(`Rejecting invite in wrong membership state: ${conversation.id}:${player.id}: ${JSON.stringify(member)}`);
  }
  stopConversation(game, now, conversation);
}

export function leaveConversation(game: GameState, now: number, conversation: Conversation, player: Player): void {
  const member = conversation.participants.get(player.id);
  if (!member) {
    throw new Error(`Couldn't find membership for ${conversation.id}:${player.id}`);
  }
  stopConversation(game, now, conversation);
}

export function stopConversation(game: GameState, now: number, conversation: Conversation): void {
  game.conversations.delete(conversation.id);
}

export function setIsTyping(conversation: Conversation, now: number, player: Player, messageUuid: string): Conversation {
  if (conversation.isTyping) {
    if (conversation.isTyping.playerId !== player.id) {
      throw new Error(`Player ${conversation.isTyping.playerId} is already typing in ${conversation.id}`);
    }
    return conversation;
  }
  
  return { ...conversation, isTyping: { playerId: player.id, messageUuid, since: now } };
}

export function finishSendingMessage(conversation: Conversation, playerId: string, timestamp: number): Conversation {
  let newConversation = conversation;
  
  if (newConversation.isTyping && newConversation.isTyping.playerId === playerId) {
    newConversation = { ...newConversation, isTyping: undefined };
  }
  
  return {
    ...newConversation,
    lastMessage: { author: playerId, timestamp },
    numMessages: newConversation.numMessages + 1,
  };
}