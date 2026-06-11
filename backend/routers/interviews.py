from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.connection import get_db
from database.models import Interview, JobApplication
from schemas.job import InterviewCreate
from core.dependencies import require_admin

router = APIRouter(prefix="/interviews", tags=["interviews"])


@router.post("")
def create_interview(
    payload: InterviewCreate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    app = db.query(JobApplication).filter(
        JobApplication.id == payload.application_id
    ).first()
    if not app:
        raise HTTPException(status_code=404, detail="Lamaran tidak ditemukan")

    try:
        interview_dt = datetime.fromisoformat(payload.interview_at.replace("Z", "+00:00"))
    except Exception:
        raise HTTPException(status_code=400, detail="Format tanggal interview tidak valid")

    interview = Interview(
        application_id=payload.application_id,
        interview_at=interview_dt,
        application_status=payload.application_status,
    )
    db.add(interview)

    # Update application
    app.interview_at = interview_dt
    if payload.application_status:
        app.status = payload.application_status

    db.commit()
    db.refresh(interview)

    return {
        "message": "Interview berhasil dijadwalkan",
        "data": {
            "id": interview.id,
            "application_id": interview.application_id,
            "interview_at": str(interview.interview_at),
        },
    }
