from fastapi import WebSocket, WebSocketDisconnect, APIRouter
from services.websocket_manager import ws_manager
import json
from datetime import datetime

router = APIRouter()


@router.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await ws_manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                if message.get("action") == "subscribe":
                    char_id = message.get("char_id")
                    if char_id:
                        ws_manager.subscribe_to_character(client_id, char_id)
                        await websocket.send_text(json.dumps({
                            "type": "subscription",
                            "status": "success",
                            "char_id": char_id
                        }))
                elif message.get("action") == "unsubscribe":
                    char_id = message.get("char_id")
                    if char_id:
                        ws_manager.unsubscribe_from_character(client_id, char_id)
                elif message.get("action") == "heartbeat":
                    await websocket.send_text(json.dumps({
                        "type": "heartbeat",
                        "timestamp": datetime.now().isoformat()
                    }))
            except json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, client_id)