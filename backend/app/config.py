from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg://leads:leads_dev_password@localhost:5432/leads"
    secret_key: str = "change-me"
    places_api_key: str = ""
    cors_origins: list[str] = ["http://localhost:3000"]

    model_config = SettingsConfigDict(env_file="../.env", extra="ignore")


settings = Settings()
