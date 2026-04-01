from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import Union
from app.core.database import get_db
from app.core.security import decode_token
from app.models.user import User
from app.models.graduate import Graduate

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> User:
    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
        )
    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario no encontrado")
    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Se requieren permisos de administrador",
        )
    return current_user


def get_current_graduate_or_admin(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> Union[User, Graduate]:
    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
        )
    sub: str = payload.get("sub", "")
    if sub.startswith("graduate_"):
        graduate_id = int(sub.split("_", 1)[1])
        graduate = db.query(Graduate).filter(Graduate.id == graduate_id).first()
        if not graduate:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Egresado no encontrado")
        return graduate
    else:
        user = db.query(User).filter(User.id == int(sub)).first()
        if not user or not user.is_active:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario no encontrado")
        return user
