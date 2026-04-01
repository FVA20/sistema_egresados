import smtplib
import uuid
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session

from app.api.v1.deps import require_admin, get_current_graduate_or_admin
from app.core.config import settings
from app.core.database import get_db
from app.models.graduate import Graduate
from app.models.news import News
from app.schemas.news import NewsCreate, NewsUpdate, NewsResponse

router = APIRouter(prefix="/news", tags=["Noticias"])

UPLOAD_DIR = Path(__file__).resolve().parents[4] / "uploads"

CATEGORY_COLORS = {
    "Noticia":      {"bg": "#eff6ff", "color": "#1d4ed8"},
    "Convocatoria": {"bg": "#ecfdf5", "color": "#059669"},
    "Evento":       {"bg": "#fdf4ff", "color": "#9333ea"},
    "Comunicado":   {"bg": "#fff7ed", "color": "#ea580c"},
}


def _send_news_email(to_email: str, to_name: str, item: News) -> bool:
    if not settings.SMTP_HOST or not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        return False
    try:
        cat = item.category or "Noticia"
        colors = CATEGORY_COLORS.get(cat, CATEGORY_COLORS["Noticia"])
        portal_url = f"{settings.FRONTEND_URL}/portal/inicio"
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"[{cat}] {item.title} — IESTP Enrique López Albújar"
        msg["From"] = settings.SMTP_FROM or settings.SMTP_USER
        msg["To"] = to_email
        html = f"""
        <html><body style="font-family:system-ui,sans-serif;background:#f0f9ff;padding:32px;">
          <div style="max-width:580px;margin:0 auto;background:white;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
            <div style="background:linear-gradient(135deg,#0891b2,#0e7490);padding:36px 40px 28px;">
              <p style="color:rgba(255,255,255,.6);font-size:12px;margin:0 0 6px;text-transform:uppercase;letter-spacing:.08em;">Portal de Egresados</p>
              <h1 style="color:white;font-size:20px;font-weight:900;margin:0;">IESTP Enrique López Albújar</h1>
            </div>
            <div style="padding:32px 40px;">
              <span style="display:inline-block;font-size:11px;font-weight:700;padding:4px 12px;border-radius:99px;background:{colors['bg']};color:{colors['color']};margin-bottom:16px;">{cat}</span>
              <h2 style="font-size:20px;font-weight:900;color:#0f172a;margin:0 0 12px;line-height:1.3;">{item.title}</h2>
              {f'<p style="font-size:14px;color:#64748b;line-height:1.7;margin:0 0 24px;">{item.summary}</p>' if item.summary else ''}
              <p style="font-size:14px;color:#64748b;margin:0 0 28px;">
                Hola <strong style="color:#0f172a;">{to_name}</strong>, hay nueva información publicada en el Portal de Egresados.
                Ingresa para mantenerte al día con las últimas actualizaciones.
              </p>
              <a href="{portal_url}" style="display:inline-block;background:#0891b2;color:white;font-weight:700;font-size:15px;padding:14px 32px;border-radius:12px;text-decoration:none;">
                Ver en el portal →
              </a>
              <p style="font-size:12px;color:#94a3b8;margin:28px 0 0;line-height:1.6;">
                Ingresa con tu correo y apellido en <a href="{settings.FRONTEND_URL}/portal/login" style="color:#0891b2;">{settings.FRONTEND_URL}/portal/login</a>
              </p>
            </div>
          </div>
        </body></html>
        """
        msg.attach(MIMEText(html, "html"))
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(msg["From"], to_email, msg.as_string())
        return True
    except Exception:
        return False


@router.get("/", response_model=List[NewsResponse])
def get_news(db: Session = Depends(get_db), _=Depends(get_current_graduate_or_admin)):
    return db.query(News).order_by(News.created_at.desc()).all()


@router.get("/{news_id}", response_model=NewsResponse)
def get_news_item(news_id: int, db: Session = Depends(get_db), _=Depends(get_current_graduate_or_admin)):
    item = db.query(News).filter(News.id == news_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Noticia no encontrada")
    return item


@router.post("/", response_model=NewsResponse, status_code=status.HTTP_201_CREATED)
def create_news(data: NewsCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    item = News(**data.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/{news_id}", response_model=NewsResponse)
def update_news(news_id: int, data: NewsUpdate, db: Session = Depends(get_db), _=Depends(require_admin)):
    item = db.query(News).filter(News.id == news_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Noticia no encontrada")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{news_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_news(news_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    item = db.query(News).filter(News.id == news_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Noticia no encontrada")
    if item.image_path:
        old_file = UPLOAD_DIR / item.image_path
        if old_file.exists():
            old_file.unlink()
    db.delete(item)
    db.commit()


@router.post("/{news_id}/upload", response_model=NewsResponse)
async def upload_news_image(
    news_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    item = db.query(News).filter(News.id == news_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Noticia no encontrada")

    ext = Path(file.filename).suffix.lower()
    if ext not in {".jpg", ".jpeg", ".png", ".gif", ".webp"}:
        raise HTTPException(status_code=400, detail="Solo se permiten imágenes (jpg, png, gif, webp)")

    if item.image_path:
        old_file = UPLOAD_DIR / item.image_path
        if old_file.exists():
            old_file.unlink()

    unique_name = f"{uuid.uuid4()}{ext}"
    dest = UPLOAD_DIR / unique_name
    dest.write_bytes(await file.read())

    item.image_name = file.filename
    item.image_path = unique_name
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{news_id}/image", response_model=NewsResponse)
def delete_news_image(news_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    item = db.query(News).filter(News.id == news_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Noticia no encontrada")
    if item.image_path:
        file_path = UPLOAD_DIR / item.image_path
        if file_path.exists():
            file_path.unlink()
    item.image_name = None
    item.image_path = None
    db.commit()
    db.refresh(item)
    return item


@router.post("/{news_id}/upload-file", response_model=NewsResponse)
async def upload_news_file(
    news_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    item = db.query(News).filter(News.id == news_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Noticia no encontrada")

    if item.file_path:
        old = UPLOAD_DIR / item.file_path
        if old.exists():
            old.unlink()

    ext = Path(file.filename).suffix.lower()
    unique_name = f"{uuid.uuid4()}{ext}"
    dest = UPLOAD_DIR / unique_name
    dest.write_bytes(await file.read())

    item.file_name = file.filename
    item.file_path = unique_name
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{news_id}/file", response_model=NewsResponse)
def delete_news_file(news_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    item = db.query(News).filter(News.id == news_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Noticia no encontrada")
    if item.file_path:
        fp = UPLOAD_DIR / item.file_path
        if fp.exists():
            fp.unlink()
    item.file_name = None
    item.file_path = None
    db.commit()
    db.refresh(item)
    return item


@router.post("/{news_id}/notify")
def notify_graduates(news_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    item = db.query(News).filter(News.id == news_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Noticia no encontrada")
    if not item.is_published:
        raise HTTPException(status_code=400, detail="La noticia debe estar publicada para poder notificar")

    graduates = db.query(Graduate).all()
    if not graduates:
        raise HTTPException(status_code=404, detail="No hay egresados registrados")

    smtp_configured = bool(settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASSWORD)
    sent = 0
    failed = 0
    for grad in graduates:
        if _send_news_email(grad.email, grad.first_name, item):
            sent += 1
        else:
            failed += 1

    return {
        "total": len(graduates),
        "sent": sent,
        "failed": failed,
        "smtp_configured": smtp_configured,
    }
