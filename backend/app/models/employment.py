from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Date, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class EmploymentRecord(Base):
    __tablename__ = "employment_records"

    id = Column(Integer, primary_key=True, index=True)
    graduate_id = Column(Integer, ForeignKey("graduates.id"), nullable=False)
    is_employed = Column(Boolean, nullable=False)
    company_name = Column(String(200), nullable=True)
    company_sector = Column(String(150), nullable=True)   # Rubro
    job_title = Column(String(150), nullable=True)
    is_career_related = Column(Boolean, nullable=True)    # Si es de su carrera
    employment_type = Column(String(50), nullable=True)   # Full-time, Part-time, etc.
    location_city = Column(String(100), nullable=True)
    location_country = Column(String(100), nullable=True, default="Perú")
    salary_range = Column(String(50), nullable=True)      # Rango salarial
    start_date = Column(Date, nullable=True)
    is_current = Column(Boolean, default=True)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())

    graduate = relationship("Graduate", back_populates="employment_records")
