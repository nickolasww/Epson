import secrets
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.connection import get_db
from database.models import User, RefreshToken
from schemas.auth import (
    LoginRequest, RegisterRequest, RefreshTokenRequest,
    SSOLoginRequest, SSORegisterRequest,
)
from core.security import (
    hash_password, verify_password,
    create_access_token, create_refresh_token, decode_token,
)
from core.config import get_settings
from core.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()


def _build_token_response(user: User, db: Session) -> dict:
    access_token = create_access_token({"sub": user.id, "role": user.role})
    refresh_token_str = create_refresh_token({"sub": user.id})

    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    db_rt = RefreshToken(
        user_id=user.id,
        token_hash=hash_password(refresh_token_str),
        expires_at=expires_at.replace(tzinfo=None),
    )
    db.add(db_rt)
    db.commit()

    now = datetime.now(timezone.utc)
    return {
        "message": "Login berhasil",
        "data": {
            "user": {
                "id": user.id,
                "fullname": user.fullname,
                "username": user.username,
                "email": user.email,
                "position": "",
                "task": "",
                "company": None,
                "role": {
                    "id": "1",
                    "name": user.role,
                    "slug": user.role,
                    "permissions": [],
                    "is_active": True,
                    "created_at": str(now),
                    "updated_at": str(now),
                },
                "employee_number": "",
                "phone_number": "",
                "is_active": user.is_active,
                "created_at": str(user.created_at),
                "project_users": [],
            },
            "token": {
                "access_token": access_token,
                "access_token_expires_in": str(
                    now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
                ),
                "refresh_token": refresh_token_str,
                "refresh_token_expires_in": str(expires_at),
            },
        },
    }


@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email atau password salah",
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Akun tidak aktif")
    return _build_token_response(user, db)


@router.post("/register")
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email sudah terdaftar")
    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(status_code=400, detail="Username sudah digunakan")

    user = User(
        username=payload.username,
        fullname=payload.fullname,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role="user",
        is_active=True,
    )
    db.add(user)
    db.commit()
    return {"message": "Registrasi berhasil. Akun Anda telah dibuat."}


@router.post("/refresh-token")
def refresh_token(payload: RefreshTokenRequest, db: Session = Depends(get_db)):
    token_data = decode_token(payload.refresh_token)
    if not token_data or token_data.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Refresh token tidak valid")

    user_id = token_data.get("sub")
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=401, detail="User tidak ditemukan")

    new_access = create_access_token({"sub": user.id, "role": user.role})
    new_refresh = create_refresh_token({"sub": user.id})

    # Return format expected by the axios interceptor
    return {
        "message": "Token refreshed",
        "users": {
            "token": new_access,
            "refresh_token": new_refresh,
        },
    }


@router.post("/sso")
def sso_login(payload: SSOLoginRequest, db: Session = Depends(get_db)):
    # Stub SSO — not required for local demo
    raise HTTPException(status_code=501, detail="SSO tidak dikonfigurasi pada demo lokal")


@router.post("/sso/register")
def sso_register(payload: SSORegisterRequest, db: Session = Depends(get_db)):
    raise HTTPException(status_code=501, detail="SSO tidak dikonfigurasi pada demo lokal")
