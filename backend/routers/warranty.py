from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.connection import get_db
from services.warranty_service import check_warranty

router = APIRouter(prefix="/warranty", tags=["warranty"])


@router.get("/check")
def check_warranty_endpoint(serial_number: str, db: Session = Depends(get_db)):
    result = check_warranty(db, serial_number)
    if not result:
        raise HTTPException(
            status_code=404,
            detail=f"Serial number '{serial_number}' tidak ditemukan dalam database",
        )
    return {"message": "success", "data": result}


@router.get("/{serial_number}")
def check_warranty_by_path(serial_number: str, db: Session = Depends(get_db)):
    result = check_warranty(db, serial_number)
    if not result:
        raise HTTPException(
            status_code=404,
            detail=f"Serial number '{serial_number}' tidak ditemukan",
        )
    return {"message": "success", "data": result}
