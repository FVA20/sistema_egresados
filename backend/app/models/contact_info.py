from sqlalchemy import Column, Integer, String
from app.core.database import Base


class ContactInfo(Base):
    __tablename__ = "contact_info"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(50), unique=True, nullable=False)       # horario | direccion | correo
    label = Column(String(100), nullable=False)                 # Etiqueta superior (fija)
    title = Column(String(200), nullable=False)                 # Título editable
    description = Column(String(500), nullable=False)           # Descripción editable
