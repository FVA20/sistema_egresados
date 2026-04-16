from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel
from typing import Optional
from app.core.database import get_db
from app.core.security import decode_token
from app.api.v1.deps import get_current_user, require_admin, oauth2_scheme
from app.models.postulation import Postulation
from app.models.graduate import Graduate
from app.models.workplan import WorkPlan

router = APIRouter(prefix="/postulations", tags=["Postulaciones"])


def get_current_graduate(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Graduate:
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


class PostulationCreate(BaseModel):
    workplan_id: int
    message: Optional[str] = None


class StatusUpdate(BaseModel):
    status: str  # pendiente | visto | contactado


# ── Egresado: postular ──────────────────────────────────────────────────────
@router.post("/", status_code=201)
def create_postulation(
    data: PostulationCreate,
    db: Session = Depends(get_db),
    graduate: Graduate = Depends(get_current_graduate),
):
    # Verificar que el plan existe
    workplan = db.query(WorkPlan).filter(WorkPlan.id == data.workplan_id).first()
    if not workplan:
        raise HTTPException(status_code=404, detail="Plan de trabajo no encontrado")

    # Evitar duplicados
    existing = db.query(Postulation).filter(
        Postulation.graduate_id == graduate.id,
        Postulation.workplan_id == data.workplan_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya postulaste a este plan de trabajo")

    postulation = Postulation(
        graduate_id=graduate.id,
        workplan_id=data.workplan_id,
        message=data.message.strip() if data.message else None,
        status="pendiente",
    )
    db.add(postulation)
    db.commit()
    db.refresh(postulation)
    return {"id": postulation.id, "status": postulation.status}


# ── Egresado: mis postulaciones ─────────────────────────────────────────────
@router.get("/my")
def get_my_postulations(
    db: Session = Depends(get_db),
    graduate: Graduate = Depends(get_current_graduate),
):
    postulations = (
        db.query(Postulation)
        .options(joinedload(Postulation.workplan))
        .filter(Postulation.graduate_id == graduate.id)
        .order_by(Postulation.created_at.desc())
        .all()
    )
    return [
        {
            "id": p.id,
            "workplan_id": p.workplan_id,
            "workplan_title": p.workplan.title if p.workplan else "—",
            "status": p.status,
            "created_at": p.created_at.isoformat() if p.created_at else None,
        }
        for p in postulations
    ]


# ── Admin: listar todas ─────────────────────────────────────────────────────
@router.get("/")
def list_postulations(
    db: Session = Depends(get_db),
    _: object = Depends(get_current_user),
):
    postulations = (
        db.query(Postulation)
        .options(joinedload(Postulation.graduate), joinedload(Postulation.workplan))
        .order_by(Postulation.created_at.desc())
        .all()
    )
    return [
        {
            "id": p.id,
            "graduate_id": p.graduate_id,
            "graduate_name": f"{p.graduate.first_name} {p.graduate.last_name}" if p.graduate else "—",
            "graduate_email": p.graduate.email if p.graduate else "—",
            "workplan_id": p.workplan_id,
            "workplan_title": p.workplan.title if p.workplan else "—",
            "message": p.message,
            "status": p.status,
            "created_at": p.created_at.isoformat() if p.created_at else None,
        }
        for p in postulations
    ]


# ── Admin: contar pendientes ────────────────────────────────────────────────
@router.get("/pending-count")
def pending_count(
    db: Session = Depends(get_db),
    _: object = Depends(get_current_user),
):
    count = db.query(Postulation).filter(Postulation.status == "pendiente").count()
    return {"count": count}


# ── Admin: cambiar estado ───────────────────────────────────────────────────
@router.put("/{postulation_id}/status")
def update_status(
    postulation_id: int,
    data: StatusUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(require_admin),
):
    if data.status not in ("pendiente", "visto", "contactado"):
        raise HTTPException(status_code=400, detail="Estado inválido")
    p = db.query(Postulation).filter(Postulation.id == postulation_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Postulación no encontrada")
    p.status = data.status
    db.commit()
    return {"id": p.id, "status": p.status}
