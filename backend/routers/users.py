from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.connection import get_db
from database.models import User
from schemas.auth import UpdateProfileRequest, UpdatePasswordRequest
from core.dependencies import get_current_user
from core.security import hash_password

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "message": "Success",
        "users": {
            "id": current_user.id,
            "username": current_user.username,
            "Fullname": current_user.fullname,
            "email": current_user.email,
            "role": current_user.role,
        },
    }


@router.patch("/me")
def update_me(
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Handle both profile updates and password updates
    if "password" in payload:
        current_user.password_hash = hash_password(payload["password"])
    if "Fullname" in payload and payload["Fullname"]:
        current_user.fullname = payload["Fullname"]
    if "username" in payload and payload["username"]:
        existing = db.query(User).filter(
            User.username == payload["username"],
            User.id != current_user.id,
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Username sudah digunakan")
        current_user.username = payload["username"]
    if "email" in payload and payload["email"]:
        existing = db.query(User).filter(
            User.email == payload["email"],
            User.id != current_user.id,
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email sudah digunakan")
        current_user.email = payload["email"]

    db.commit()
    db.refresh(current_user)

    return {
        "message": "Profile updated",
        "users": {
            "id": current_user.id,
            "username": current_user.username,
            "Fullname": current_user.fullname,
            "email": current_user.email,
            "role": current_user.role,
        },
    }
