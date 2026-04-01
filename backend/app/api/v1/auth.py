from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db
from app.core.security import verify_password, create_access_token
from app.models.user import User
from app.models.graduate import Graduate
from app.schemas.user import LoginRequest, TokenResponse, UserResponse

router = APIRouter(prefix="/auth", tags=["Autenticación"])


class GraduateLoginRequest(BaseModel):
    email: str
    password: str


class GraduateTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    graduate: dict


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo",
        )
    token = create_access_token(data={"sub": str(user.id), "role": user.role})
    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )


@router.post("/graduate-login", response_model=GraduateTokenResponse)
def graduate_login(data: GraduateLoginRequest, db: Session = Depends(get_db)):
    email_input = data.email.strip()
    password_input = data.password.strip()
    graduate = db.query(Graduate).filter(
        (Graduate.email == email_input) | (Graduate.document_number == email_input)
    ).first()
    if not graduate or graduate.last_name.lower().strip() != password_input.lower():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
        )
    token = create_access_token(data={"sub": f"graduate_{graduate.id}", "role": "graduate"})
    return GraduateTokenResponse(
        access_token=token,
        graduate={
            "id": graduate.id,
            "first_name": graduate.first_name,
            "last_name": graduate.last_name,
            "email": graduate.email,
            "program_id": graduate.program_id,
        },
    )
