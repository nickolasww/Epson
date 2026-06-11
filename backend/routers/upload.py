"""
Error scanner: accepts image upload, runs Gemini Vision OCR analysis.
Registered at both /api/v1/upload AND /upload so Ant Design's action="/api/upload" works via Vite proxy.
"""
import os
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException
from services.ocr import analyze_error_image
from core.config import get_settings

router = APIRouter(tags=["error-scanner"])
settings = get_settings()

ALLOWED_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp", "image/bmp"}
MAX_SIZE_MB = 10


@router.post("/upload")
async def upload_error_image(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Format file tidak didukung. Gunakan: JPG, PNG, WebP, atau BMP.",
        )

    image_bytes = await file.read()

    if len(image_bytes) > MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"Ukuran file maksimal {MAX_SIZE_MB}MB")

    # Save to uploads dir
    save_dir = os.path.join(settings.UPLOADS_PATH, "error_images")
    os.makedirs(save_dir, exist_ok=True)
    ext = os.path.splitext(file.filename or "img.jpg")[1] or ".jpg"
    stored_name = f"{uuid.uuid4()}{ext}"
    save_path = os.path.join(save_dir, stored_name)
    with open(save_path, "wb") as f:
        f.write(image_bytes)

    result = await analyze_error_image(image_bytes, file.content_type)

    return {
        "message": "success",
        "data": result,
    }
