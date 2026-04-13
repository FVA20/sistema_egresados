from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
from app.core.database import get_db
from app.api.v1.deps import oauth2_scheme, get_current_user
from app.core.security import decode_token
from app.models.graduate import Graduate
from app.models.user import User

router = APIRouter(prefix="/portal", tags=["Presencia"])

ONLINE_THRESHOLD_MINUTES = 3


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

    # Comparación en SQL para evitar problemas de timezone en Python
    online_ids = {
        row.id for row in
        db.query(Graduate.id).filter(Graduate.last_seen >= threshold).all()
    }
    all_rows = db.query(Graduate.id).all()

    return [
        {"id": row.id, "online": row.id in online_ids}
        for row in all_rows
    ]
