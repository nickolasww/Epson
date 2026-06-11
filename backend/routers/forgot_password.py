import secrets
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.connection import get_db
from database.models import PasswordResetToken, User
from schemas.auth import ForgotPasswordRequest, ResetPasswordRequest, VerifyResetTokenRequest
from core.security import hash_password

router = APIRouter(prefix="/forgot-password", tags=["forgot-password"])


@router.post("/request")
def request_reset(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        # Don't reveal whether email exists
        return {"message": "Jika email terdaftar, instruksi reset telah dikirim"}

    token = secrets.token_urlsafe(32)
    reset = PasswordResetToken(
        email=payload.email,
        token=token,
        expires_at=datetime.utcnow() + timedelta(hours=1),
    )
    db.add(reset)
    db.commit()

    # In production: send email with reset link. For demo, return token.
    return {
        "message": "Jika email terdaftar, instruksi reset telah dikirim",
        "reset_token": token,  # Only for demo
    }


@router.post("/verify")
def verify_token(payload: VerifyResetTokenRequest, db: Session = Depends(get_db)):
    record = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == payload.token,
        PasswordResetToken.used == False,
        PasswordResetToken.expires_at > datetime.utcnow(),
    ).first()

    if not record:
        raise HTTPException(status_code=400, detail="Token tidak valid atau sudah kedaluwarsa")

    return {"message": "Token valid", "email": record.email}


@router.post("/reset")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    if payload.password != payload.confirm_password:
        raise HTTPException(status_code=400, detail="Password tidak cocok")

    record = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == payload.token,
        PasswordResetToken.used == False,
        PasswordResetToken.expires_at > datetime.utcnow(),
    ).first()

    if not record:
        raise HTTPException(status_code=400, detail="Token tidak valid atau sudah kedaluwarsa")

    user = db.query(User).filter(User.email == record.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")

    user.password_hash = hash_password(payload.password)
    record.used = True
    db.commit()

    return {"message": "Password berhasil direset"}
