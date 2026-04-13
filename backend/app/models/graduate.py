from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Graduate(Base):
    __tablename__ = "graduates"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    document_number = Column(String(20), unique=True, nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    phone = Column(String(20), nullable=True)
    program_id = Column(Integer, ForeignKey("programs.id"), nullable=False)
    graduation_year = Column(Integer, nullable=False)
    enrollment_year = Column(Integer, nullable=True)
    photo_url = Column(String(300), nullable=True)
    linkedin_url = Column(String(300), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_seen  = Column(DateTime(timezone=True), nullable=True)

    program = relationship("Program", back_populates="graduates")
    employment_records = relationship("EmploymentRecord", back_populates="graduate", cascade="all, delete-orphan")
    survey_tokens = relationship("SurveyToken", back_populates="graduate", cascade="all, delete-orphan")
