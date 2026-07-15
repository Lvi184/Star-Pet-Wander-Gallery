from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "星宠漫游馆"
    debug: bool = True
    database_url: str = "sqlite+aiosqlite:///./xingchong.db?check_same_thread=False&timeout=30"
    secret_key: str = "xingchong-secret-key-change-in-production"
    access_token_expire_minutes: int = 60 * 24 * 7

    deepseek_api_key: str = ""
    deepseek_base_url: str = "https://api.deepseek.com/v1"

    doubao_api_key: str = ""
    doubao_base_url: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
