import secrets
import smtplib
from datetime import datetime, timezone, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.v1.deps import require_admin
from app.core.config import settings
from app.core.database import get_db
from app.models.employment import EmploymentRecord
from app.models.graduate import Graduate
from app.models.program import Program
from app.models.survey_token import SurveyToken

router = APIRouter(prefix="/surveys", tags=["Encuestas"])


class SurveyRespondSchema(BaseModel):
    is_employed: bool
    company_name: Optional[str] = None
    company_sector: Optional[str] = None
    job_title: Optional[str] = None
    is_career_related: Optional[bool] = None
    employment_type: Optional[str] = None
    location_city: Optional[str] = None


def _send_email(to_email: str, to_name: str, survey_url: str) -> bool:
    if not settings.SMTP_HOST or not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        return False
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Encuesta de Seguimiento — IESTP Enrique López Albújar"
        msg["From"] = settings.SMTP_FROM or settings.SMTP_USER
        msg["To"] = to_email
        html = f"""
        <html><body style="font-family:system-ui,sans-serif;background:#f0f9ff;padding:32px;">
          <div style="max-width:560px;margin:0 auto;background:white;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
            <div style="background:linear-gradient(135deg,#0891b2,#0e7490);padding:40px 40px 32px;">
              <h1 style="color:white;font-size:22px;font-weight:900;margin:0 0 8px;">Portal de Egresados</h1>
              <p style="color:rgba(255,255,255,.7);font-size:13px;margin:0;">IESTP Enrique López Albújar</p>
            </div>
            <div style="padding:36px 40px;">
              <p style="font-size:16px;font-weight:700;color:#0f172a;margin:0 0 12px;">Hola, {to_name} 👋</p>
              <p style="font-size:14px;color:#64748b;line-height:1.7;margin:0 0 28px;">
                Te invitamos a completar una breve encuesta sobre tu situación laboral actual.
                Tus respuestas nos ayudan a mejorar nuestros programas y apoyar mejor a nuestros egresados.
              </p>
              <a href="{survey_url}" style="display:inline-block;background:#0891b2;color:white;font-weight:700;font-size:15px;padding:14px 32px;border-radius:12px;text-decoration:none;">
                Completar Encuesta →
              </a>
              <p style="font-size:12px;color:#94a3b8;margin:24px 0 0;line-height:1.6;">
                Este enlace es personal e intransferible. Solo puede usarse una vez y expira en 7 días.
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


@router.post("/send")
def send_surveys(
    program_id: Optional[int] = Query(None),
    graduation_year: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    query = db.query(Graduate)
    if program_id:
        query = query.filter(Graduate.program_id == program_id)
    if graduation_year:
        query = query.filter(Graduate.graduation_year == graduation_year)
    graduates = query.all()

    if not graduates:
        raise HTTPException(status_code=404, detail="No se encontraron egresados con esos filtros")

    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    results = []

    for grad in graduates:
        token_str = secrets.token_urlsafe(32)
        db.add(SurveyToken(graduate_id=grad.id, token=token_str, expires_at=expires_at))
        db.flush()
        survey_url = f"{settings.FRONTEND_URL}/encuesta/{token_str}"
        email_sent = _send_email(grad.email, grad.first_name, survey_url)
        results.append({
            "name": f"{grad.first_name} {grad.last_name}",
            "email": grad.email,
            "survey_url": survey_url,
            "email_sent": email_sent,
        })

    db.commit()
    return {"total": len(results), "results": results}


@router.get("/token/{token}")
def get_survey_info(token: str, db: Session = Depends(get_db)):
    st = db.query(SurveyToken).filter(SurveyToken.token == token).first()
    if not st:
        raise HTTPException(status_code=404, detail="Encuesta no encontrada")
    if st.used_at:
        raise HTTPException(status_code=410, detail="Esta encuesta ya fue respondida")
    if st.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=410, detail="Este enlace ha expirado")
    grad = db.query(Graduate).filter(Graduate.id == st.graduate_id).first()
    prog = db.query(Program).filter(Program.id == grad.program_id).first()
    return {
        "graduate_name": f"{grad.first_name} {grad.last_name}",
        "program_name": prog.name if prog else "—",
    }


@router.post("/token/{token}/respond")
def respond_survey(token: str, data: SurveyRespondSchema, db: Session = Depends(get_db)):
    st = db.query(SurveyToken).filter(SurveyToken.token == token).first()
    if not st:
        raise HTTPException(status_code=404, detail="Encuesta no encontrada")
    if st.used_at:
        raise HTTPException(status_code=410, detail="Esta encuesta ya fue respondida")
    if st.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=410, detail="Este enlace ha expirado")

    db.query(EmploymentRecord).filter(
        EmploymentRecord.graduate_id == st.graduate_id,
        EmploymentRecord.is_current == True,
    ).update({"is_current": False})

    db.add(EmploymentRecord(
        graduate_id=st.graduate_id,
        is_employed=data.is_employed,
        company_name=data.company_name,
        company_sector=data.company_sector,
        job_title=data.job_title,
        is_career_related=data.is_career_related,
        employment_type=data.employment_type,
        location_city=data.location_city,
        is_current=True,
    ))
    st.used_at = datetime.now(timezone.utc)
    db.commit()
    return {"message": "Respuesta registrada correctamente. ¡Gracias!"}
