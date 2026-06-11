"""
Job Positions router.
Public:  GET /job-positions, GET /job-positions/slug/{slug}
Admin:   GET|POST /job-positions/admin, GET|PATCH|DELETE /job-positions/admin/{id},
         GET /job-positions/admin/deleted, PATCH /job-positions/admin/restore/{id}

IMPORTANT: Define specific routes before parameterised ones to avoid FastAPI shadowing.
"""
import re
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from database.connection import get_db
from database.models import JobPosition, JobApplication
from schemas.job import JobPositionCreate, JobPositionUpdate
from core.dependencies import get_current_user, require_admin

router = APIRouter(tags=["job-positions"])


def _to_dict(jp: JobPosition, include_applicant_count: bool = False) -> dict:
    d = {
        "id": jp.id,
        "title": jp.title,
        "slug": jp.slug,
        "location": jp.location,
        "department": jp.department,
        "salary": jp.salary,
        "employment_type": jp.employment_type,
        "requirements": jp.requirements,
        "responsibilities": jp.responsibilities,
        "publication_status": jp.publication_status,
        "is_active": jp.is_active,
        "closed_at": str(jp.closed_at) if jp.closed_at else None,
        "posted_at": str(jp.posted_at) if jp.posted_at else None,
        "updated_at": str(jp.updated_at) if jp.updated_at else None,
        "applicant_count": 0,
    }
    return d


def _parse_closed_at(closed_at_str):
    if not closed_at_str:
        return None
    try:
        return datetime.fromisoformat(closed_at_str.replace("Z", "+00:00"))
    except Exception:
        return None


# ─────────────────────────────────────────────
# Public endpoints
# ─────────────────────────────────────────────

@router.get("/job-positions")
def list_job_positions(
    limit: int = Query(3, ge=1, le=100),
    cursor: str = Query(None),
    search: str = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(JobPosition).filter(
        JobPosition.publication_status == "active",
        JobPosition.is_active == True,
        JobPosition.deleted_at == None,
    )
    if search:
        q = q.filter(JobPosition.title.ilike(f"%{search}%"))
    if cursor:
        q = q.filter(JobPosition.id > cursor)

    jobs = q.order_by(JobPosition.posted_at.desc()).limit(limit + 1).all()
    has_more = len(jobs) > limit
    items = jobs[:limit]

    return {
        "message": "success",
        "job_positions": {
            "list": [_to_dict(j) for j in items],
            "next_cursor": items[-1].id if has_more and items else None,
        },
    }


@router.get("/job-positions/slug/{slug}")
def get_job_by_slug(slug: str, db: Session = Depends(get_db)):
    job = db.query(JobPosition).filter(
        JobPosition.slug == slug,
        JobPosition.deleted_at == None,
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Lowongan tidak ditemukan")
    return {"message": "success", "job_positions": _to_dict(job)}


# ─────────────────────────────────────────────
# Admin endpoints — specific routes first
# ─────────────────────────────────────────────

@router.get("/job-positions/admin/deleted")
def list_deleted_jobs(
    limit: int = Query(10, ge=1, le=100),
    cursor: str = Query(None),
    status: str = Query(None),
    job_title: str = Query(None),
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    q = db.query(JobPosition).filter(JobPosition.deleted_at != None)
    if job_title:
        q = q.filter(JobPosition.title.ilike(f"%{job_title}%"))
    if cursor:
        q = q.filter(JobPosition.id > cursor)

    jobs = q.order_by(JobPosition.posted_at.desc()).limit(limit + 1).all()
    has_more = len(jobs) > limit
    items = jobs[:limit]

    return {
        "message": "success",
        "job_positions": {
            "list": [_to_dict(j) for j in items],
            "next_cursor": items[-1].id if has_more and items else None,
        },
    }


@router.patch("/job-positions/admin/restore/{job_id}")
def restore_job(
    job_id: str,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    job = db.query(JobPosition).filter(
        JobPosition.id == job_id,
        JobPosition.deleted_at != None,
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Lowongan tidak ditemukan")
    job.deleted_at = None
    db.commit()
    return {"message": "Lowongan berhasil dipulihkan"}


@router.get("/job-positions/admin")
def list_admin_jobs(
    limit: int = Query(100, ge=1, le=500),
    cursor: str = Query(None),
    status: str = Query(None),
    search: str = Query(None),
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    q = db.query(JobPosition).filter(JobPosition.deleted_at == None)
    if status:
        q = q.filter(JobPosition.publication_status == status)
    if search:
        q = q.filter(JobPosition.title.ilike(f"%{search}%"))
    if cursor:
        q = q.filter(JobPosition.id > cursor)

    jobs = q.order_by(JobPosition.posted_at.desc()).limit(limit + 1).all()
    has_more = len(jobs) > limit
    items = jobs[:limit]

    total_applicant = db.query(func.count(JobApplication.id)).filter(
        JobApplication.deleted_at == None
    ).scalar() or 0
    total_active = db.query(func.count(JobPosition.id)).filter(
        JobPosition.publication_status == "active",
        JobPosition.deleted_at == None,
    ).scalar() or 0
    total_vacancy = db.query(func.count(JobPosition.id)).filter(
        JobPosition.deleted_at == None
    ).scalar() or 0

    return {
        "message": "success",
        "job_positions": {
            "list": [_to_dict(j) for j in items],
            "total_applicant": total_applicant,
            "total_active": total_active,
            "total_vacancy": total_vacancy,
            "next_cursor": items[-1].id if has_more and items else None,
        },
    }


@router.post("/job-positions/admin")
def create_job(
    payload: JobPositionCreate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    if db.query(JobPosition).filter(JobPosition.slug == payload.slug).first():
        raise HTTPException(status_code=400, detail="Slug sudah digunakan")

    job = JobPosition(
        title=payload.title,
        slug=payload.slug,
        location=payload.location,
        department=payload.department,
        salary=payload.salary,
        employment_type=payload.employment_type,
        requirements=payload.requirements,
        responsibilities=payload.responsibilities,
        publication_status=payload.publication_status,
        is_active=payload.is_active,
        closed_at=_parse_closed_at(payload.closed_at),
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return {"message": "Lowongan berhasil dibuat", "job_positions": _to_dict(job)}


@router.get("/job-positions/admin/{job_id}")
def get_admin_job(
    job_id: str,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    job = db.query(JobPosition).filter(
        JobPosition.id == job_id,
        JobPosition.deleted_at == None,
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Lowongan tidak ditemukan")
    return {"message": "success", "job_positions": _to_dict(job)}


@router.patch("/job-positions/admin/{job_id}")
def update_job(
    job_id: str,
    payload: JobPositionUpdate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    job = db.query(JobPosition).filter(
        JobPosition.id == job_id,
        JobPosition.deleted_at == None,
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Lowongan tidak ditemukan")

    update_data = payload.model_dump(exclude_none=True)
    if "closed_at" in update_data:
        update_data["closed_at"] = _parse_closed_at(update_data["closed_at"])

    for key, val in update_data.items():
        setattr(job, key, val)

    db.commit()
    return {"message": "successfully updated job position"}


@router.delete("/job-positions/admin/{job_id}/soft")
def soft_delete_job(
    job_id: str,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    job = db.query(JobPosition).filter(
        JobPosition.id == job_id,
        JobPosition.deleted_at == None,
    ).first()
    if not job:
        raise HTTPException(status_code=404, detail="Lowongan tidak ditemukan")

    job.deleted_at = datetime.utcnow()
    db.commit()
    return {"message": "Lowongan berhasil dihapus"}
