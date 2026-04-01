from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.contact_info import ContactInfo
from app.schemas.contact_info import ContactInfoResponse, ContactInfoUpdate
from app.api.v1.deps import require_admin

router = APIRouter(prefix="/contact", tags=["Contacto"])


@router.get("/", response_model=List[ContactInfoResponse])
def get_contact_info(db: Session = Depends(get_db)):
    return db.query(ContactInfo).order_by(ContactInfo.id).all()


@router.put("/{key}", response_model=ContactInfoResponse)
def update_contact_info(
    key: str,
    data: ContactInfoUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    item = db.query(ContactInfo).filter(ContactInfo.key == key).first()
    if not item:
        raise HTTPException(status_code=404, detail="Elemento de contacto no encontrado")
    item.title = data.title
    item.description = data.description
    db.commit()
    db.refresh(item)
    return item
