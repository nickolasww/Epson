"""
Job Applications router.
Public:  POST /job-applications, GET /job-applications/history
Admin:   GET /job-applications/admin, GET|PATCH|DELETE /job-applications/admin/{id},
         PATCH /job-applications/admin/{id}/status, GET /job-applications/admin/{id}/cv
"""
import os
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from database.connection import get_db
from database.models import JobApplication, JobPosition, UploadedFile
from schemas.job import ApplicationStatusUpdate
from core.dependencies import get_current_user, require_admin
from core.config import get_settings

router = APIRouter(tags=["job-applications"])
settings = get_settings()

ALLOWED_CV_TYPES = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}


def _to_dict(app: JobApplication) -> dict:
    return {
        "id": app.id,
        "job_id": app.job_position_id,
        "applicant_id": app.applicant_id,
        "job_title": app.job_title,
        "email": app.email,
        "file_id": app.file_id,
        "status": app.status,
        "phone_number": app.phone_number,
        "submitted_at": str(app.submitted_at) if app.submitted_at else None,
        "interview_at": str(app.interview_at) if app.interview_at else None,
        "first_name": app.first_name,
        "last_name": app.last_name,
        "address": app.address,
    }


# ─────────────────────────────────────────────
# Public
# ─────────────────────────────────────────────

@router.post("/job-applications")
async def submit_application(
    job_position_id: str = Form(...),
    first_name: str = Form(...),
    last_name: str = Form(...),
    email: str = Form(...),
    phone_number: str = Form(...),
    address: str = Form(""),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    job = db.query(JobPosition).filter(
        JobPosition.id == str(job_position_id),
        JobPosition.publication_status == "active",
        JobPosition.deleted_at == None,
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Lowongan tidak ditemukan")

    # Save CV file
    file_bytes = await file.read()
    save_dir = os.path.join(settings.UPLOADS_PATH, "cvs")
    os.makedirs(save_dir, exist_ok=True)
    ext = os.path.splitext(file.filename or "cv.pdf")[1] or ".pdf"
    stored_name = f"{uuid.uuid4()}{ext}"
    save_path = os.path.join(save_dir, stored_name)
    with open(save_path, "wb") as f:
        f.write(file_bytes)

    uploaded = UploadedFile(
        filename=file.filename or stored_name,
        stored_filename=stored_name,
        file_path=save_path,
        content_type=file.content_type or "application/octet-stream",
    )
    db.add(uploaded)
    db.flush()

    application = JobApplication(
        job_position_id=str(job_position_id),
        job_title=job.title,
        first_name=first_name,
        last_name=last_name,
        email=email,
        phone_number=phone_number,
        address=address,
        file_id=uploaded.id,
        status="submitted",
    )
    db.add(application)
    db.commit()
    db.refresh(application)

    return {
        "message": "Lamaran berhasil dikirim",
        "data": {
            "id": application.id,
            "job_position_id": application.job_position_id,
            "first_name": application.first_name,
            "last_name": application.last_name,
            "email": application.email,
            "phone_number": application.phone_number,
            "address": application.address,
            "created_at": str(application.submitted_at),
        },
    }


@router.get("/job-applications/history")
def get_application_history(
    limit: int = Query(8, ge=1, le=100),
    cursor: str = Query(None),
    search: str = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    q = db.query(JobApplication).filter(
        JobApplication.email == current_user.email,
        JobApplication.deleted_at == None,
    )
    if search:
        q = q.filter(JobApplication.job_title.ilike(f"%{search}%"))
    if cursor:
        q = q.filter(JobApplication.id > cursor)

    apps = q.order_by(JobApplication.submitted_at.desc()).limit(limit).all()

    items = [
        {
            "id": a.id,
            "job_id": a.job_position_id,
            "job_title": a.job_title,
            "status": a.status,
            "applied_at": str(a.submitted_at) if a.submitted_at else None,
            "interview_at": str(a.interview_at) if a.interview_at else None,
            "email": a.email,
            "first_name": a.first_name,
            "last_name": a.last_name,
            "phone_number": a.phone_number,
        }
        for a in apps
    ]

    return {
        "message": "success",
        "job_applications": {"items": items},
    }


# ─────────────────────────────────────────────
# Admin — specific routes before parameterised
# ─────────────────────────────────────────────

@router.get("/job-applications/admin")
def list_admin_applications(
    limit: int = Query(10, ge=1, le=100),
    cursor: str = Query(None),
    status: str = Query(None),
    job_title: str = Query(None),
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    q = db.query(JobApplication).filter(JobApplication.deleted_at == None)
    if status:
        q = q.filter(JobApplication.status == status)
    if job_title:
        q = q.filter(JobApplication.job_title.ilike(f"%{job_title}%"))
    if cursor:
        q = q.filter(JobApplication.id > cursor)

    apps = q.order_by(JobApplication.submitted_at.desc()).limit(limit + 1).all()
    has_more = len(apps) > limit
    items = apps[:limit]

    return {
        "message": "success",
        "job_applications": {
            "list": [_to_dict(a) for a in items],
            "next_cursor": items[-1].id if has_more and items else None,
        },
    }


@router.get("/job-applications/admin/{app_id}/cv")
def get_cv(
    app_id: str,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    app = db.query(JobApplication).filter(JobApplication.id == app_id).first()
    if not app or not app.file_id:
        raise HTTPException(status_code=404, detail="CV tidak ditemukan")

    file_record = db.query(UploadedFile).filter(UploadedFile.id == app.file_id).first()
    if not file_record or not os.path.exists(file_record.file_path):
        raise HTTPException(status_code=404, detail="File tidak ditemukan di server")

    # Return the file path URL for the frontend to download
    return {"job_applications": f"/api/v1/files/{file_record.id}"}


@router.get("/job-applications/admin/{app_id}")
def get_admin_application(
    app_id: str,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    app = db.query(JobApplication).filter(JobApplication.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Lamaran tidak ditemukan")
    return {"message": "success", "job_applications": _to_dict(app)}


@router.patch("/job-applications/admin/{app_id}/status")
def update_application_status(
    app_id: str,
    payload: ApplicationStatusUpdate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    app = db.query(JobApplication).filter(JobApplication.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Lamaran tidak ditemukan")

    if payload.status:
        app.status = payload.status
    if payload.interview_at:
        try:
            app.interview_at = datetime.fromisoformat(
                payload.interview_at.replace("Z", "+00:00")
            )
        except Exception:
            pass

    db.commit()
    return {"message": "Status lamaran berhasil diperbarui"}


@router.delete("/job-applications/admin/{app_id}")
def delete_application(
    app_id: str,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    app = db.query(JobApplication).filter(JobApplication.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Lamaran tidak ditemukan")
    app.deleted_at = datetime.utcnow()
    db.commit()
    return {"message": "Lamaran berhasil dihapus"}
