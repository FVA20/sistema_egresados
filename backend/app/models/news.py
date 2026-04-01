from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from sqlalchemy.sql import func
from app.core.database import Base


class News(Base):
    __tablename__ = "news"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    summary = Column(String(500), nullable=True)
    content = Column(Text, nullable=True)
    category = Column(String(100), nullable=True, default="Noticia")
    image_name = Column(String(300), nullable=True)
    image_path = Column(String(400), nullable=True)
    link = Column(String(500), nullable=True)
    file_name = Column(String(300), nullable=True)
    file_path = Column(String(400), nullable=True)
    is_published = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
