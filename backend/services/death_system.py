from sqlalchemy.ext.asyncio import AsyncSession
from models.character import Character
from models.biography import Biography
from models.event import PetEvent
from datetime import datetime
import random


class DeathSystem:
    DEATH_TYPES = ["sacrifice", "legend", "starry"]

    def __init__(self, db: AsyncSession):
        self.db = db

    async def check_death(self, character: Character) -> bool:
        if character.health <= 0:
            return True
        if character.status == "critical" and character.health < 10:
            roll = random.random()
            if roll < 0.3:
                return True
        return False

    async def determine_death_type(self, character: Character) -> str:
        personality = character.personality or {}
        empathy = personality.get("empathy", 50)
        adventure = personality.get("adventure", 50)
        persistence = personality.get("persistence", 50)

        if empathy > 80 or persistence > 80:
            return "sacrifice"

        if adventure > 80:
            return "legend"

        total_events = await self._count_events(character.id)
        if total_events > 50:
            return "legend"

        return "starry"

    async def _count_events(self, char_id: str) -> int:
        from sqlalchemy import select, func
        result = await self.db.execute(
            select(func.count()).where(PetEvent.char_id == char_id)
        )
        return result.scalar()

    async def generate_death_narrative(self, character: Character, cause_chain: list) -> dict:
        death_type = await self.determine_death_type(character)
        narrative = self._generate_narrative(character, death_type, cause_chain)
        
        biography = Biography(
            id=Biography.generate_id(),
            char_id=character.id,
            title=narrative["title"],
            content=narrative["content"],
            milestone="death",
            timestamp=datetime.now()
        )
        self.db.add(biography)
        
        character.status = "dead"
        await self.db.commit()

        return {
            "death_type": death_type,
            "title": narrative["title"],
            "content": narrative["content"],
            "cause_chain": cause_chain,
            "biography_id": biography.id
        }

    def _generate_narrative(self, character: Character, death_type: str, cause_chain: list) -> dict:
        species_map = {
            "fox": "青丘狐",
            "dragon": "小青龙",
            "phoenix": "凤凰",
            "rabbit": "玉兔",
            "tiger": "白虎"
        }
        species_name = species_map.get(character.species, character.species)

        if death_type == "sacrifice":
            return {
                "title": f"{character.name}的牺牲",
                "content": f"{species_name}{character.name}用生命守护了重要的事物。它的故事将被永远铭记，成为后人传颂的传说。在最后的时刻，它选择了牺牲自己，换取他人的平安。这是一场伟大的告别，它的精神将永远留在这片山海之间。"
            }
        elif death_type == "legend":
            return {
                "title": f"{character.name}的传说",
                "content": f"{species_name}{character.name}的一生充满了冒险与传奇。它探索过最危险的秘境，结交过最奇特的朋友，留下了无数精彩的故事。虽然它的旅程结束了，但它的传说将永远流传。人们会在青丘的树下讲述它的故事，让它的精神永远活在后人心中。"
            }
        else:
            return {
                "title": f"{character.name}的星空",
                "content": f"{species_name}{character.name}安静地离开了这个世界。它化作了夜空中的一颗星星，继续守护着这片山海。每当你仰望星空，就能看到它在那里闪烁。它的故事也许平凡，但它的存在本身就是一种美好。温柔的告别，是为了更好的重逢。"
            }

    async def get_death_report(self, char_id: str) -> dict:
        character = await self.db.get(Character, char_id)
        if not character or character.status != "dead":
            return {"success": False, "message": "角色未死亡"}

        from sqlalchemy import select
        results = await self.db.execute(
            select(Biography).where(Biography.char_id == char_id, Biography.milestone == "death")
        )
        biography = results.scalar_one_or_none()

        recent_events = await self.db.execute(
            select(PetEvent).where(PetEvent.char_id == char_id).order_by(PetEvent.timestamp.desc()).limit(10)
        )
        events = [e.to_dict() for e in recent_events.scalars().all()]

        cause_chain = []
        for event in events:
            if event.get("cause_chain"):
                cause_chain.extend(event["cause_chain"])

        return {
            "success": True,
            "character_name": character.name,
            "character_species": character.species,
            "death_time": character.last_active.isoformat() if character.last_active else None,
            "biography": biography.to_dict() if biography else None,
            "recent_events": events,
            "cause_chain": list(set(cause_chain))
        }