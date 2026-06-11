"""
Epson Smart Helpdesk Chatbot — Backend API
FastAPI + MySQL + FAISS + Gemini AI
"""
import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from core.config import get_settings
from database.connection import init_db, get_db
from database.models import UploadedFile
from services import rag as rag_service

from routers import (
    auth, users, chatbot, upload, warranty,
    job_positions, job_applications, interviews,
    otp, forgot_password,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initialising database tables...")
    try:
        init_db()
        logger.info("Database tables ready.")
    except Exception as e:
        logger.error("DB init failed: %s", e)

    logger.info("Loading FAISS index...")
    loaded = rag_service.load_faiss_index()
    if loaded:
        logger.info("FAISS index loaded successfully.")
    else:
        logger.warning(
            "FAISS index not found. Chatbot will use fallback responses. "
            "Run: cd backend && python scripts/build_index.py"
        )
    yield


app = FastAPI(
    title="Epson Smart Helpdesk API",
    description="AI-powered helpdesk backend for Epson Indonesia",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_ORIGIN,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files as static assets
uploads_path = os.path.abspath(settings.UPLOADS_PATH)
os.makedirs(uploads_path, exist_ok=True)
app.mount("/static/uploads", StaticFiles(directory=uploads_path), name="uploads")

PREFIX = "/api/v1"

app.include_router(auth.router, prefix=PREFIX)
app.include_router(users.router, prefix=PREFIX)
app.include_router(otp.router, prefix=PREFIX)
app.include_router(forgot_password.router, prefix=PREFIX)
app.include_router(chatbot.router, prefix=PREFIX)
app.include_router(warranty.router, prefix=PREFIX)
app.include_router(job_positions.router, prefix=PREFIX)
app.include_router(job_applications.router, prefix=PREFIX)
app.include_router(interviews.router, prefix=PREFIX)

# /api/v1/upload  AND  /api/upload (for Ant Design Upload component via Vite proxy)
app.include_router(upload.router, prefix=PREFIX)
app.include_router(upload.router, prefix="/api")


@app.get("/api/v1/files/{file_id}")
def download_file(file_id: str, db: Session = Depends(get_db)):
    record = db.query(UploadedFile).filter(UploadedFile.id == file_id).first()
    if not record or not os.path.exists(record.file_path):
        raise HTTPException(status_code=404, detail="File tidak ditemukan")
    return FileResponse(
        record.file_path,
        filename=record.filename,
        media_type=record.content_type,
    )


@app.get("/health")
def health():
    return {"status": "ok", "service": "Epson Smart Helpdesk API"}


@app.get("/")
def root():
    return {"message": "Epson Smart Helpdesk API v1.0", "docs": "/docs"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.APP_HOST,
        port=settings.APP_PORT,
        reload=True,
    )
