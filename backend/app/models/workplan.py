from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class WorkPlan(Base):
    __tablename__ = "work_plans"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    content = Column(Text, nullable=True)
    program_id = Column(Integer, ForeignKey("programs.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    file_name = Column(String(300), nullable=True)   # nombre original del archivo
    file_path = Column(String(400), nullable=True)   # nombre UUID guardado en disco

    program = relationship("Program", back_populates="work_plans")
