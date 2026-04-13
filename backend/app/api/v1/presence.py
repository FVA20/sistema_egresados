from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from datetime import datetime, timezone, timedelta
from typing import List
from app.core.database import get_db
from app.api.v1.deps import oauth2_scheme, get_current_user
from app.core.security import decode_token
from app.models.graduate import Graduate
from app.models.user import User

router = APIRouter(prefix="/portal", tags=["Presencia"])

ONLINE_THRESHOLD_MINUTES = 2


def get_current_graduate(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> Graduate:
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")
    sub: str = payload.get("sub", "")
    if not sub.startswith("graduate_"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo egresados")
    graduate_id = int(sub.split("_", 1)[1])
    graduate = db.query(Graduate).filter(Graduate.id == graduate_id).first()
    if not graduate:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Egresado no encontrado")
    return graduate


@router.post("/ping")
def ping(graduate: Graduate = Depends(get_current_graduate), db: Session = Depends(get_db)):
    graduate.last_seen = datetime.now(timezone.utc)
    db.commit()
    return {"ok": True}


@router.get("/active-graduates")
def active_graduates(
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    threshold = datetime.now(timezone.utc) - timedelta(minutes=ONLINE_THRESHOLD_MINUTES)
    rows = db.query(Graduate.id, Graduate.last_seen).all()
    return [
        {"id": r.id, "online": r.last_seen is not None and r.last_seen.replace(tzinfo=timezone.utc) >= threshold}
        for r in rows
    ]
