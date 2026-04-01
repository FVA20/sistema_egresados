from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    APP_NAME: str = "Sistema de Egresados"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    FIRST_ADMIN_EMAIL: str
    FIRST_ADMIN_PASSWORD: str

    # SMTP — opcional, para envío de encuestas por correo
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = ""
    FRONTEND_URL: str = "http://localhost:5173"

    class Config:
        env_file = ".env"


settings = Settings()
