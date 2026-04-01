from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import Optional
import pandas as pd
import io
from app.core.database import get_db
from app.models.graduate import Graduate
from app.models.employment import EmploymentRecord
from app.models.program import Program
from app.api.v1.deps import require_admin

router = APIRouter(prefix="/reports", tags=["Reportes"])


@router.get("/stats")
def get_stats(db: Session = Depends(get_db), _=Depends(require_admin)):
    total_graduates = db.query(Graduate).count()
    total_employed = db.query(EmploymentRecord).filter(
        EmploymentRecord.is_employed == True, EmploymentRecord.is_current == True
    ).count()
    career_related = db.query(EmploymentRecord).filter(
        EmploymentRecord.is_career_related == True, EmploymentRecord.is_current == True
    ).count()

    by_program = (
        db.query(Program.name, func.count(Graduate.id).label("total"))
        .join(Graduate, Graduate.program_id == Program.id)
        .group_by(Program.name)
        .all()
    )
    by_sector = (
        db.query(EmploymentRecord.company_sector, func.count(EmploymentRecord.id).label("total"))
        .filter(
            EmploymentRecord.is_current == True,
            EmploymentRecord.is_employed == True,
            EmploymentRecord.company_sector.isnot(None),
            EmploymentRecord.company_sector != "",
        )
        .group_by(EmploymentRecord.company_sector)
        .order_by(func.count(EmploymentRecord.id).desc())
        .limit(6)
        .all()
    )

    not_career_related = total_employed - career_related

    return {
        "total_graduates": total_graduates,
        "total_employed": total_employed,
        "employment_rate": round((total_employed / total_graduates * 100), 1) if total_graduates else 0,
        "career_related": career_related,
        "career_related_rate": round((career_related / total_employed * 100), 1) if total_employed else 0,
        "not_career_related": not_career_related,
        "not_career_related_rate": round((not_career_related / total_employed * 100), 1) if total_employed else 0,
        "by_program": [{"program": r[0], "total": r[1]} for r in by_program],
        "top_sectors": [{"sector": r[0], "total": r[1]} for r in by_sector],
    }


@router.get("/export/excel")
def export_excel(
    program_id: Optional[int] = Query(None),
    graduation_year: Optional[int] = Query(None),
    employment_filter: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    query = (
        db.query(
            Graduate.first_name,
            Graduate.last_name,
            Graduate.document_number,
            Graduate.email,
            Graduate.phone,
            Graduate.graduation_year,
            Program.name.label("program"),
            EmploymentRecord.is_employed,
            EmploymentRecord.company_name,
            EmploymentRecord.company_sector,
            EmploymentRecord.job_title,
            EmploymentRecord.is_career_related,
        )
        .join(Program, Graduate.program_id == Program.id)
        .outerjoin(
            EmploymentRecord,
            (EmploymentRecord.graduate_id == Graduate.id) & (EmploymentRecord.is_current == True),
        )
    )
    if program_id:
        query = query.filter(Graduate.program_id == program_id)
    if graduation_year:
        query = query.filter(Graduate.graduation_year == graduation_year)
    if employment_filter == "sin_empleo":
        query = query.filter(
            (EmploymentRecord.is_employed == False) | (EmploymentRecord.id == None)
        )
    elif employment_filter == "en_carrera":
        query = query.filter(
            EmploymentRecord.is_employed == True,
            EmploymentRecord.is_career_related == True,
            EmploymentRecord.is_current == True,
        )
    elif employment_filter == "fuera_carrera":
        query = query.filter(
            EmploymentRecord.is_employed == True,
            EmploymentRecord.is_career_related == False,
            EmploymentRecord.is_current == True,
        )

    rows = query.all()
    df = pd.DataFrame(rows, columns=[
        "Nombre", "Apellido", "Documento", "Email", "Teléfono",
        "Año Egreso", "Programa", "Empleado", "Empresa",
        "Rubro", "Cargo", "Relacionado a Carrera",
    ])

    output = io.BytesIO()
    with pd.ExcelWriter(output, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Egresados")
    output.seek(0)

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=egresados.xlsx"},
    )
