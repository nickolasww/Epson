"""
OCR service: Gemini Vision analyzes printer error images.
Returns structured error code analysis and repair recommendations.
"""
import logging
import json
import re
import google.generativeai as genai
from PIL import Image
import io
from core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

_model = None


def _get_model():
    global _model
    if _model is None:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        _model = genai.GenerativeModel("gemini-2.5-flash")
    return _model


async def analyze_error_image(image_bytes: bytes, content_type: str = "image/jpeg") -> dict:
    """
    Send image to Gemini Vision and extract printer error information.
    Returns a structured dict with error code, description, solutions, and cost estimate.
    """
    try:
        img = Image.open(io.BytesIO(image_bytes))
        if img.mode not in ("RGB", "L"):
            img = img.convert("RGB")
        buf = io.BytesIO()
        img.save(buf, format="JPEG")
        buf.seek(0)
        img_bytes = buf.read()
    except Exception as e:
        logger.error("Image preprocessing failed: %s", e)
        return _error_response("Gambar tidak dapat diproses. Pastikan format gambar valid (JPG/PNG).")

    prompt = """Kamu adalah teknisi printer Epson berpengalaman.
Analisis gambar ini yang menunjukkan layar atau tampilan error printer.

Berikan respons dalam format JSON berikut (hanya JSON, tanpa markdown atau teks lain):
{
  "detected_error_code": "kode error yang terdeteksi (mis: 0x97, E-01, W-11), atau 'Tidak Terdeteksi'",
  "confidence": angka_persentase_0_sampai_100,
  "description": "deskripsi masalah dalam bahasa Indonesia",
  "solutions": [
    "langkah solusi 1",
    "langkah solusi 2",
    "langkah solusi 3"
  ],
  "estimated_service_cost_min": angka_dalam_rupiah,
  "estimated_service_cost_max": angka_dalam_rupiah,
  "severity": "ringan|sedang|berat",
  "can_self_repair": true_atau_false
}

Jika tidak ada kode error yang terlihat, tetap berikan analisis visual berdasarkan kondisi printer yang terlihat."""

    try:
        model = _get_model()

        image_part = {
            "mime_type": "image/jpeg",
            "data": img_bytes,
        }

        response = model.generate_content([prompt, image_part])
        raw_text = response.text.strip()

        # Extract JSON from response
        json_match = re.search(r"\{[\s\S]*\}", raw_text)
        if not json_match:
            raise ValueError("No JSON found in response")

        result = json.loads(json_match.group())

        # Normalize fields
        cost_min = result.get("estimated_service_cost_min", 150000)
        cost_max = result.get("estimated_service_cost_max", 350000)

        return {
            "detected_error_code": result.get("detected_error_code", "Tidak Terdeteksi"),
            "confidence": min(100, max(0, int(result.get("confidence", 0)))),
            "description": result.get("description", "Tidak dapat mengidentifikasi masalah."),
            "solutions": result.get("solutions", []),
            "estimated_service_cost": f"Rp{cost_min:,} - Rp{cost_max:,}".replace(",", "."),
            "severity": result.get("severity", "sedang"),
            "can_self_repair": result.get("can_self_repair", False),
        }

    except json.JSONDecodeError as e:
        logger.warning("JSON parse error from Gemini response: %s", e)
        return _parse_text_response(response.text if "response" in dir() else "")
    except Exception as e:
        logger.error("OCR analysis failed: %s", e)
        return _error_response(f"Analisis gagal: {str(e)}")


def _parse_text_response(text: str) -> dict:
    """Fallback: parse Gemini text response when JSON parsing fails."""
    return {
        "detected_error_code": "Tidak Terdeteksi",
        "confidence": 50,
        "description": text[:500] if text else "Tidak dapat menganalisis gambar.",
        "solutions": [
            "Restart printer dan coba lagi",
            "Periksa kabel dan koneksi",
            "Hubungi Epson Service Center",
        ],
        "estimated_service_cost": "Rp150.000 - Rp350.000",
        "severity": "sedang",
        "can_self_repair": False,
    }


def _error_response(message: str) -> dict:
    return {
        "detected_error_code": "Error",
        "confidence": 0,
        "description": message,
        "solutions": ["Hubungi Epson Service Center untuk bantuan lebih lanjut."],
        "estimated_service_cost": "Rp150.000 - Rp350.000",
        "severity": "tidak diketahui",
        "can_self_repair": False,
    }
