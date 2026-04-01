from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app.core.database import get_db
from app.models.graduate import Graduate
from app.schemas.graduate import GraduateCreate, GraduateUpdate, GraduateResponse
from app.api.v1.deps import get_current_user, require_admin

router = APIRouter(prefix="/graduates", tags=["Egresados"])


@router.get("/", response_model=List[GraduateResponse])
def list_graduates(
    skip: int = 0,
    limit: int = 20,
    search: Optional[str] = Query(None),
    program_id: Optional[int] = Query(None),
    graduation_year: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    query = db.query(Graduate)
    if search:
        query = query.filter(
            (Graduate.first_name.ilike(f"%{search}%"))
            | (Graduate.last_name.ilike(f"%{search}%"))
            | (Graduate.email.ilike(f"%{search}%"))
            | (Graduate.document_number.ilike(f"%{search}%"))
        )
    if program_id:
        query = query.filter(Graduate.program_id == program_id)
    if graduation_year:
        query = query.filter(Graduate.graduation_year == graduation_year)
    return query.offset(skip).limit(limit).all()


@router.get("/{graduate_id}", response_model=GraduateResponse)
def get_graduate(
    graduate_id: int,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    graduate = db.query(Graduate).filter(Graduate.id == graduate_id).first()
    if not graduate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Egresado no encontrado")
    return graduate


@router.post("/", response_model=GraduateResponse, status_code=status.HTTP_201_CREATED)
def create_graduate(
    data: GraduateCreate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    existing = db.query(Graduate).filter(
        (Graduate.email == data.email) | (Graduate.document_number == data.document_number)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe un egresado con ese email o documento")
    graduate = Graduate(**data.model_dump())
    db.add(graduate)
    db.commit()
    db.refresh(graduate)
    return graduate


@router.put("/{graduate_id}", response_model=GraduateResponse)
def update_graduate(
    graduate_id: int,
    data: GraduateUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    graduate = db.query(Graduate).filter(Graduate.id == graduate_id).first()
    if not graduate:
        raise HTTPException(status_code=404, detail="Egresado no encontrado")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(graduate, field, value)
    db.commit()
    db.refresh(graduate)
    return graduate


@router.delete("/{graduate_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_graduate(
    graduate_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    graduate = db.query(Graduate).filter(Graduate.id == graduate_id).first()
    if not graduate:
        raise HTTPException(status_code=404, detail="Egresado no encontrado")
    db.delete(graduate)
    db.commit()
