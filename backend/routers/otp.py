import random
import string
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.connection import get_db
from database.models import OtpCode, User
from schemas.auth import VerifyOtpRequest, ResendOtpRequest

router = APIRouter(prefix="/otp", tags=["otp"])


def _generate_otp(length: int = 6) -> str:
    return "".join(random.choices(string.digits, k=length))


@router.post("/verify")
def verify_otp(payload: VerifyOtpRequest, db: Session = Depends(get_db)):
    otp = (
        db.query(OtpCode)
        .filter(
            OtpCode.email == payload.email,
            OtpCode.code == payload.otp_code,
            OtpCode.used == False,
            OtpCode.expires_at > datetime.utcnow(),
        )
        .first()
    )

    if not otp:
        raise HTTPException(status_code=400, detail="OTP tidak valid atau sudah kedaluwarsa")

    otp.used = True
    user = db.query(User).filter(User.email == payload.email).first()
    if user:
        user.is_active = True
    db.commit()

    return {"message": "OTP berhasil diverifikasi"}


@router.post("/resend")
def resend_otp(payload: ResendOtpRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Email tidak terdaftar")

    code = _generate_otp()
    otp = OtpCode(
        user_id=user.id,
        email=payload.email,
        code=code,
        expires_at=datetime.utcnow() + timedelta(minutes=15),
    )
    db.add(otp)
    db.commit()

    # In production: send email. For demo, return the OTP code directly.
    return {"message": "OTP telah dikirim", "otp_code": code}
