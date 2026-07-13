type EventCallback = (data: any) => void;

class EventBus {
  private listeners: Map<string, Set<EventCallback>> = new Map();

  on(event: string, callback: EventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: EventCallback): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  emit(event: string, data?: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  clear(): void {
    this.listeners.clear();
  }
}

export const eventBus = new EventBus();

export const GAME_EVENTS = {
  REGION_ENTER: 'region-enter',
  PLAYER_MOVE: 'player-move',
  ACTION_PERFORM: 'action-perform',
  STATUS_UPDATE: 'status-update',
  CONTROL_CHANGE: 'control-change',
  DEATH_EVENT: 'death-event',
  REWIND: 'rewind',

  SPAWN_PET: 'spawn-pet',
  MOVE_PET: 'move-pet',
  FOCUS_PET: 'focus-pet',
  CONTROL_SWITCH: 'control-switch',
  SCENE_READY: 'scene-ready',
  PET_POSITION_UPDATE: 'pet-position-update',
  PET_ACTIVITY: 'pet-activity',
  ENVIRONMENT_EVENT: 'environment-event',
};

export interface SpawnPetData {
  pets: Array<{ id: string; name: string; species: string; current_region?: string | null }>;
}

export interface MovePetData {
  petId: string;
  region: string;
}

export interface FocusPetData {
  petId: string;
}

export interface ControlSwitchData {
  petId: string;
  controllerType: 'player' | 'agent';
}

export interface PetPositionData {
  petId: string;
  x: number;
  y: number;
  region?: string;
}

export interface EnvironmentEventData {
  eventName: string;
  eventType: string;
  action: 'start' | 'end';
}
