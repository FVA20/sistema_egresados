from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.employment import EmploymentRecord
from app.models.graduate import Graduate
from app.schemas.employment import EmploymentCreate, EmploymentUpdate, EmploymentResponse
from app.api.v1.deps import get_current_user, require_admin

router = APIRouter(prefix="/employment", tags=["Empleabilidad"])


@router.get("/graduate/{graduate_id}", response_model=List[EmploymentResponse])
def get_employment_by_graduate(
    graduate_id: int,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    graduate = db.query(Graduate).filter(Graduate.id == graduate_id).first()
    if not graduate:
        raise HTTPException(status_code=404, detail="Egresado no encontrado")
    return db.query(EmploymentRecord).filter(
        EmploymentRecord.graduate_id == graduate_id
    ).order_by(EmploymentRecord.recorded_at.desc()).all()


@router.post("/", response_model=EmploymentResponse, status_code=status.HTTP_201_CREATED)
def create_employment(
    data: EmploymentCreate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    graduate = db.query(Graduate).filter(Graduate.id == data.graduate_id).first()
    if not graduate:
        raise HTTPException(status_code=404, detail="Egresado no encontrado")
    record = EmploymentRecord(**data.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.put("/{record_id}", response_model=EmploymentResponse)
def update_employment(
    record_id: int,
    data: EmploymentUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    record = db.query(EmploymentRecord).filter(EmploymentRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Registro no encontrado")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(record, field, value)
    db.commit()
    db.refresh(record)
    return record


@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employment(
    record_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    record = db.query(EmploymentRecord).filter(EmploymentRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Registro no encontrado")
    db.delete(record)
    db.commit()
