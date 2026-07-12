import asyncio
from datetime import datetime
from typing import Optional


class EventScheduler:
    def __init__(self):
        self._tasks: dict[str, asyncio.Task] = {}

    async def start_offline_events(self, pet_id: str, interval_minutes: int = 30):
        if pet_id in self._tasks:
            self._tasks[pet_id].cancel()

        async def loop():
            while True:
                await asyncio.sleep(interval_minutes * 60)
                await self._trigger_event(pet_id)

        self._tasks[pet_id] = asyncio.create_task(loop())

    async def stop(self, pet_id: str):
        task = self._tasks.pop(pet_id, None)
        if task:
            task.cancel()

    async def _trigger_event(self, pet_id: str) -> dict:
        # 触发离线事件，实际会调用 LangGraph
        from ai.graph import run_pet_behavior_graph
        result = await run_pet_behavior_graph(pet_id, {})
        return result


scheduler = EventScheduler()
