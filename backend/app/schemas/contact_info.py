from pydantic import BaseModel


class ContactInfoResponse(BaseModel):
    id: int
    key: str
    label: str
    title: str
    description: str

    class Config:
        from_attributes = True


class ContactInfoUpdate(BaseModel):
    title: str
    description: str
