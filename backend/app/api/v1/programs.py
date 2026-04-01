from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.program import Program
from app.schemas.program import ProgramCreate, ProgramUpdate, ProgramResponse
from app.api.v1.deps import get_current_user, require_admin, get_current_graduate_or_admin

router = APIRouter(prefix="/programs", tags=["Programas"])


@router.get("/", response_model=List[ProgramResponse])
def list_programs(db: Session = Depends(get_db), _=Depends(get_current_graduate_or_admin)):
    return db.query(Program).all()


@router.get("/{program_id}", response_model=ProgramResponse)
def get_program(program_id: int, db: Session = Depends(get_db), _=Depends(get_current_graduate_or_admin)):
    program = db.query(Program).filter(Program.id == program_id).first()
    if not program:
        raise HTTPException(status_code=404, detail="Programa no encontrado")
    return program


@router.post("/", response_model=ProgramResponse, status_code=status.HTTP_201_CREATED)
def create_program(data: ProgramCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    existing = db.query(Program).filter(Program.name == data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe un programa con ese nombre")
    program = Program(**data.model_dump())
    db.add(program)
    db.commit()
    db.refresh(program)
    return program


@router.put("/{program_id}", response_model=ProgramResponse)
def update_program(
    program_id: int, data: ProgramUpdate, db: Session = Depends(get_db), _=Depends(require_admin)
):
    program = db.query(Program).filter(Program.id == program_id).first()
    if not program:
        raise HTTPException(status_code=404, detail="Programa no encontrado")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(program, field, value)
    db.commit()
    db.refresh(program)
    return program


@router.delete("/{program_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_program(program_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    program = db.query(Program).filter(Program.id == program_id).first()
    if not program:
        raise HTTPException(status_code=404, detail="Programa no encontrado")
    db.delete(program)
    db.commit()
