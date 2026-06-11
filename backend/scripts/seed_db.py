"""
Seed the database with:
- Admin user (admin@epson.com / admin123)
- Sample warranty products (serial numbers for demo)
- Sample job positions

Usage (from backend/ directory):
    python scripts/seed_db.py
"""
import sys
import os
from pathlib import Path
from datetime import datetime, timedelta

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from database.connection import SessionLocal, init_db
from database.models import User, WarrantyProduct, JobPosition
from core.security import hash_password


def seed_users(db):
    users_data = [
        {
            "username": "admin",
            "fullname": "Admin Epson",
            "email": "admin@epson.com",
            "password": "admin123",
            "role": "admin",
        },
        {
            "username": "superadmin",
            "fullname": "Super Admin",
            "email": "superadmin@epson.com",
            "password": "super123",
            "role": "super_admin",
        },
        {
            "username": "demouser",
            "fullname": "Demo User",
            "email": "demo@epson.com",
            "password": "demo123",
            "role": "user",
        },
    ]
    for u in users_data:
        if not db.query(User).filter(User.email == u["email"]).first():
            db.add(User(
                username=u["username"],
                fullname=u["fullname"],
                email=u["email"],
                password_hash=hash_password(u["password"]),
                role=u["role"],
                is_active=True,
            ))
            print(f"  Created user: {u['email']} / {u['password']}")
        else:
            print(f"  Skipped (exists): {u['email']}")
    db.commit()


def seed_warranty(db):
    now = datetime.utcnow()
    products = [
        {
            "serial_number": "XSB1234567",
            "product_name": "Epson L3250",
            "product_type": "Ink Tank Printer",
            "category": "All-In-One",
            "warranty_end": now + timedelta(days=993),
            "service_cost_min": 250000,
            "service_cost_max": 400000,
            "service_center_name": "Epson Service Malang",
            "service_center_address": "Jl. Soekarno Hatta No.45, Malang",
            "service_center_hours": "08:00 – 17:00",
        },
        {
            "serial_number": "L4260DEMO01",
            "product_name": "Epson L4260",
            "product_type": "Ink Tank Printer",
            "category": "All-In-One",
            "warranty_end": now + timedelta(days=450),
            "service_cost_min": 200000,
            "service_cost_max": 350000,
            "service_center_name": "Epson Service Surabaya",
            "service_center_address": "Jl. HR Muhammad No.12, Surabaya",
            "service_center_hours": "08:00 – 17:00",
        },
        {
            "serial_number": "WF3825DEMO",
            "product_name": "Epson WorkForce WF-3825",
            "product_type": "WorkForce Printer",
            "category": "Single Function Inkjet",
            "warranty_end": now + timedelta(days=120),
            "service_cost_min": 300000,
            "service_cost_max": 500000,
            "service_center_name": "Epson Service Jakarta",
            "service_center_address": "Jl. Hayam Wuruk No.8, Jakarta Pusat",
            "service_center_hours": "08:00 – 17:00",
        },
        {
            "serial_number": "L6490DEMO01",
            "product_name": "Epson L6490",
            "product_type": "Ink Tank Printer",
            "category": "All-In-One",
            "warranty_end": now - timedelta(days=30),  # Expired
            "service_cost_min": 350000,
            "service_cost_max": 600000,
            "service_center_name": "Epson Service Bandung",
            "service_center_address": "Jl. Buah Batu No.55, Bandung",
            "service_center_hours": "08:00 – 17:00",
        },
        {
            "serial_number": "ET2400DEMO1",
            "product_name": "Epson EcoTank ET-2400",
            "product_type": "EcoTank Printer",
            "category": "Single Function Inkjet",
            "warranty_end": now + timedelta(days=730),
            "service_cost_min": 200000,
            "service_cost_max": 300000,
            "service_center_name": "Epson Service Yogyakarta",
            "service_center_address": "Jl. Magelang No.88, Yogyakarta",
            "service_center_hours": "08:00 – 17:00",
        },
    ]
    for p in products:
        if not db.query(WarrantyProduct).filter(
            WarrantyProduct.serial_number == p["serial_number"]
        ).first():
            db.add(WarrantyProduct(
                serial_number=p["serial_number"],
                product_name=p["product_name"],
                product_type=p["product_type"],
                category=p.get("category"),
                warranty_start=now - timedelta(days=365),
                warranty_end=p["warranty_end"],
                service_cost_min=p["service_cost_min"],
                service_cost_max=p["service_cost_max"],
                service_center_name=p.get("service_center_name"),
                service_center_address=p.get("service_center_address"),
                service_center_hours=p.get("service_center_hours"),
            ))
            print(f"  Created warranty: {p['serial_number']} → {p['product_name']}")
        else:
            print(f"  Skipped (exists): {p['serial_number']}")
    db.commit()


def seed_jobs(db):
    jobs = [
        {
            "title": "AI Engineer",
            "slug": "ai-engineer-2026",
            "location": "Jakarta, Indonesia",
            "department": "Technology",
            "salary": "Rp15.000.000 - Rp25.000.000",
            "employment_type": "full_time",
            "requirements": "- Min. S1 Teknik Informatika\n- Pengalaman 2+ tahun di AI/ML\n- Familiar dengan Python, PyTorch/TensorFlow\n- Pengalaman dengan NLP dan computer vision",
            "responsibilities": "- Mengembangkan dan melatih model AI\n- Mengintegrasikan model ke sistem produksi\n- Berkolaborasi dengan tim teknis\n- Melakukan riset teknologi AI terbaru",
            "publication_status": "active",
        },
        {
            "title": "Frontend Developer",
            "slug": "frontend-developer-2026",
            "location": "Surabaya, Indonesia",
            "department": "Technology",
            "salary": "Rp10.000.000 - Rp18.000.000",
            "employment_type": "full_time",
            "requirements": "- Min. S1 Ilmu Komputer\n- Menguasai React.js, TypeScript\n- Familiar dengan Tailwind CSS\n- Pengalaman 1+ tahun",
            "responsibilities": "- Membangun UI/UX yang responsif\n- Berkolaborasi dengan tim backend\n- Optimasi performa aplikasi web\n- Code review dan dokumentasi",
            "publication_status": "active",
        },
        {
            "title": "Customer Support Specialist",
            "slug": "customer-support-2026",
            "location": "Jakarta, Indonesia",
            "department": "Customer Service",
            "salary": "Rp6.000.000 - Rp9.000.000",
            "employment_type": "full_time",
            "requirements": "- Min. D3/S1 semua jurusan\n- Komunikasi baik\n- Familiar dengan produk Epson\n- Kemampuan problem-solving",
            "responsibilities": "- Menangani pertanyaan dan keluhan pelanggan\n- Memberikan solusi teknis printer\n- Mendokumentasikan tiket support\n- Berkoordinasi dengan tim teknis",
            "publication_status": "active",
        },
    ]
    for j in jobs:
        if not db.query(JobPosition).filter(JobPosition.slug == j["slug"]).first():
            db.add(JobPosition(**j))
            print(f"  Created job: {j['title']}")
        else:
            print(f"  Skipped (exists): {j['slug']}")
    db.commit()


if __name__ == "__main__":
    print("Initialising DB schema...")
    init_db()

    print("Opening DB session...")
    db = SessionLocal()

    try:
        print("\n[1/3] Seeding users...")
        seed_users(db)

        print("\n[2/3] Seeding warranty products...")
        seed_warranty(db)

        print("\n[3/3] Seeding job positions...")
        seed_jobs(db)

        print("\nDone! Demo credentials:")
        print("  Admin   : admin@epson.com / admin123")
        print("  Super   : superadmin@epson.com / super123")
        print("  User    : demo@epson.com / demo123")
        print("\nDemo serial numbers for warranty check:")
        print("  XSB1234567  → Epson L3250 (aktif ~993 hari)")
        print("  L4260DEMO01 → Epson L4260 (aktif ~450 hari)")
        print("  WF3825DEMO  → Epson WF-3825 (aktif ~120 hari)")
        print("  L6490DEMO01 → Epson L6490 (kedaluwarsa)")
        print("  ET2400DEMO1 → Epson EcoTank ET-2400 (aktif ~730 hari)")
    finally:
        db.close()
