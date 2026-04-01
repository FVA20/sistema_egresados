from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class NewsCreate(BaseModel):
    title: str
    summary: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = "Noticia"
    link: Optional[str] = None
    is_published: bool = True


class NewsUpdate(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    link: Optional[str] = None
    is_published: Optional[bool] = None


class NewsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    summary: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    image_name: Optional[str] = None
    image_path: Optional[str] = None
    link: Optional[str] = None
    file_name: Optional[str] = None
    file_path: Optional[str] = None
    is_published: bool
    created_at: datetime
