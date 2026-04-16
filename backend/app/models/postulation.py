from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Postulation(Base):
    __tablename__ = "postulations"

    id = Column(Integer, primary_key=True, index=True)
    graduate_id = Column(Integer, ForeignKey("graduates.id", ondelete="CASCADE"), nullable=False)
    workplan_id = Column(Integer, ForeignKey("work_plans.id", ondelete="CASCADE"), nullable=False)
    message = Column(String(500), nullable=True)
    status = Column(String(20), default="pendiente", nullable=False)  # pendiente | visto | contactado
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    graduate = relationship("Graduate")
    workplan = relationship("WorkPlan")
