from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class WorkPlanCreate(BaseModel):
    title: str
    description: Optional[str] = None
    content: Optional[str] = None
    program_id: int
    is_active: bool = True


class WorkPlanUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    program_id: Optional[int] = None
    is_active: Optional[bool] = None


class WorkPlanResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: Optional[str] = None
    content: Optional[str] = None
    program_id: int
    is_active: bool
    created_at: datetime
    file_name: Optional[str] = None
    file_path: Optional[str] = None
