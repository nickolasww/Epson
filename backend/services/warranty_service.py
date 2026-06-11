from datetime import datetime, timezone
from sqlalchemy.orm import Session
from database.models import WarrantyProduct


def check_warranty(db: Session, serial_number: str) -> dict | None:
    """Look up a product by serial number and return warranty info."""
    product = db.query(WarrantyProduct).filter(
        WarrantyProduct.serial_number == serial_number.upper().strip()
    ).first()

    if not product:
        return None

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    warranty_end = product.warranty_end

    days_remaining = (warranty_end - now).days
    is_active = days_remaining > 0 and product.is_active

    if days_remaining > 365:
        remaining_text = f"{days_remaining // 365} tahun {days_remaining % 365} hari lagi"
    elif days_remaining > 0:
        remaining_text = f"{days_remaining} hari lagi"
    else:
        remaining_text = "Garansi telah habis"

    warranty_end_str = warranty_end.strftime("%-d %B %Y").replace(
        "January", "Januari").replace("February", "Februari").replace(
        "March", "Maret").replace("April", "April").replace(
        "May", "Mei").replace("June", "Juni").replace(
        "July", "Juli").replace("August", "Agustus").replace(
        "September", "September").replace("October", "Oktober").replace(
        "November", "November").replace("December", "Desember")

    return {
        "productName": product.product_name,
        "status": "Aktif" if is_active else "Tidak Aktif",
        "serialNumber": product.serial_number,
        "productType": product.product_type,
        "warrantyStatus": "Aktif" if is_active else "Kedaluwarsa",
        "warrantyStart": warranty_end_str,
        "sisaGaransi": remaining_text,
        "estimasiMin": f"Rp{product.service_cost_min:,}".replace(",", "."),
        "estimasiMax": f"Rp{product.service_cost_max:,}".replace(",", "."),
        "serviceCenter": {
            "name": product.service_center_name or "Epson Service Center",
            "address": product.service_center_address or "Hubungi 1500-345 untuk lokasi terdekat",
            "hours": product.service_center_hours or "08:00 – 17:00",
        },
    }
