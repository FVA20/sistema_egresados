from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.api.v1 import auth, graduates, employment, programs, reports, users, workplans, news, contact, surveys
from app.models import news as _news_model  # noqa: F401 — registra la tabla en Base

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    redirect_slashes=False,
)

# CORS — permite que React (localhost:5173) consuma la API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(graduates.router, prefix="/api/v1")
app.include_router(employment.router, prefix="/api/v1")
app.include_router(programs.router, prefix="/api/v1")
app.include_router(reports.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(workplans.router, prefix="/api/v1")
app.include_router(news.router, prefix="/api/v1")
app.include_router(contact.router, prefix="/api/v1")
app.include_router(surveys.router, prefix="/api/v1")

# Servir archivos subidos
UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")


@app.get("/")
def root():
    return {"message": f"{settings.APP_NAME} v{settings.APP_VERSION} - OK"}
