import uuid
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.v1.deps import require_admin, get_current_graduate_or_admin
from app.models.workplan import WorkPlan
from app.schemas.workplan import WorkPlanCreate, WorkPlanUpdate, WorkPlanResponse

router = APIRouter(prefix="/work-plans", tags=["Planes de Trabajo"])

UPLOAD_DIR = Path(__file__).resolve().parents[4] / "uploads"
ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx", ".png", ".jpg", ".jpeg", ".gif", ".mp4", ".mov", ".avi", ".webm"}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB


def _ensure_upload_dir():
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.get("/", response_model=List[WorkPlanResponse])
def list_work_plans(
    db: Session = Depends(get_db),
    _=Depends(get_current_graduate_or_admin),
):
    return db.query(WorkPlan).all()


@router.get("/by-program/{program_id}", response_model=List[WorkPlanResponse])
def get_work_plans_by_program(
    program_id: int,
    db: Session = Depends(get_db),
    _=Depends(get_current_graduate_or_admin),
):
    return db.query(WorkPlan).filter(WorkPlan.program_id == program_id).all()


@router.post("/", response_model=WorkPlanResponse, status_code=status.HTTP_201_CREATED)
def create_work_plan(
    data: WorkPlanCreate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    work_plan = WorkPlan(**data.model_dump())
    db.add(work_plan)
    db.commit()
    db.refresh(work_plan)
    return work_plan


@router.put("/{work_plan_id}", response_model=WorkPlanResponse)
def update_work_plan(
    work_plan_id: int,
    data: WorkPlanUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    work_plan = db.query(WorkPlan).filter(WorkPlan.id == work_plan_id).first()
    if not work_plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan de trabajo no encontrado")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(work_plan, field, value)
    db.commit()
    db.refresh(work_plan)
    return work_plan


@router.post("/{work_plan_id}/upload", response_model=WorkPlanResponse)
async def upload_file(
    work_plan_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    work_plan = db.query(WorkPlan).filter(WorkPlan.id == work_plan_id).first()
    if not work_plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan de trabajo no encontrado")

    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tipo de archivo no permitido. Permitidos: PDF, Word, imágenes y videos.",
        )

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo supera el límite de 50 MB.",
        )

    # Si ya tenía un archivo, eliminar el anterior
    if work_plan.file_path:
        old_path = UPLOAD_DIR / work_plan.file_path
        if old_path.exists():
            old_path.unlink()

    _ensure_upload_dir()
    stored_name = f"{uuid.uuid4().hex}{ext}"
    (UPLOAD_DIR / stored_name).write_bytes(contents)

    work_plan.file_name = file.filename
    work_plan.file_path = stored_name
    db.commit()
    db.refresh(work_plan)
    return work_plan


@router.delete("/{work_plan_id}/file", response_model=WorkPlanResponse)
def delete_file(
    work_plan_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    work_plan = db.query(WorkPlan).filter(WorkPlan.id == work_plan_id).first()
    if not work_plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan de trabajo no encontrado")

    if work_plan.file_path:
        old_path = UPLOAD_DIR / work_plan.file_path
        if old_path.exists():
            old_path.unlink()
        work_plan.file_name = None
        work_plan.file_path = None
        db.commit()
        db.refresh(work_plan)

    return work_plan


@router.delete("/{work_plan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_work_plan(
    work_plan_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    work_plan = db.query(WorkPlan).filter(WorkPlan.id == work_plan_id).first()
    if not work_plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan de trabajo no encontrado")

    # Eliminar archivo adjunto si existe
    if work_plan.file_path:
        old_path = UPLOAD_DIR / work_plan.file_path
        if old_path.exists():
            old_path.unlink()

    db.delete(work_plan)
    db.commit()
