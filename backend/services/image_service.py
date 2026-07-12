import hashlib


async def generate_scene_image(prompt: str) -> str:
    """
    Demo 阶段返回占位图链接。
    生产环境接入豆包生图 API 或 Stable Diffusion。
    """
    seed = hashlib.md5(prompt.encode()).hexdigest()[:8]
    return f"https://picsum.photos/seed/{seed}/800/600"
