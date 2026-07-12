from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, Set, List
import json

class WebSocketManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        self.character_subscriptions: Dict[str, Set[str]] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        if client_id not in self.active_connections:
            self.active_connections[client_id] = set()
        self.active_connections[client_id].add(websocket)

    def disconnect(self, websocket: WebSocket, client_id: str):
        if client_id in self.active_connections:
            self.active_connections[client_id].discard(websocket)
            if not self.active_connections[client_id]:
                del self.active_connections[client_id]

    def subscribe_to_character(self, client_id: str, char_id: str):
        if char_id not in self.character_subscriptions:
            self.character_subscriptions[char_id] = set()
        self.character_subscriptions[char_id].add(client_id)

    def unsubscribe_from_character(self, client_id: str, char_id: str):
        if char_id in self.character_subscriptions:
            self.character_subscriptions[char_id].discard(client_id)
            if not self.character_subscriptions[char_id]:
                del self.character_subscriptions[char_id]

    async def broadcast_to_subscribers(self, char_id: str, message: dict):
        if char_id in self.character_subscriptions:
            client_ids = self.character_subscriptions[char_id]
            for client_id in client_ids:
                if client_id in self.active_connections:
                    for connection in self.active_connections[client_id]:
                        try:
                            await connection.send_text(json.dumps(message))
                        except:
                            pass

    async def send_to_client(self, client_id: str, message: dict):
        if client_id in self.active_connections:
            for connection in self.active_connections[client_id]:
                try:
                    await connection.send_text(json.dumps(message))
                except:
                    pass

    async def broadcast_all(self, message: dict):
        for client_id in self.active_connections:
            await self.send_to_client(client_id, message)

ws_manager = WebSocketManager()