from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base


class Program(Base):
    __tablename__ = "programs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False, unique=True)
    faculty = Column(String(150), nullable=False)
    degree_level = Column(String(50), nullable=False)  # Bachiller, Licenciatura, etc.
    duration_years = Column(Integer, nullable=False)
    active = Column(Boolean, default=True)

    graduates = relationship("Graduate", back_populates="program")
    work_plans = relationship("WorkPlan", back_populates="program")
