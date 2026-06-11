import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Boolean, DateTime, Text, Integer,
    ForeignKey, Enum, Float, func
)
from sqlalchemy.orm import relationship
from database.connection import Base


def gen_uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    username = Column(String(100), unique=True, nullable=False)
    fullname = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum("user", "admin", "super_admin"), default="user", nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    applications = relationship("JobApplication", back_populates="applicant")
    otp_codes = relationship("OtpCode", back_populates="user")


class OtpCode(Base):
    __tablename__ = "otp_codes"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    email = Column(String(255), nullable=False)
    code = Column(String(10), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="otp_codes")


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    email = Column(String(255), nullable=False)
    token = Column(String(255), unique=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    token_hash = Column(String(255), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    revoked = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class JobPosition(Base):
    __tablename__ = "job_positions"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False)
    location = Column(String(255), nullable=False)
    department = Column(String(255), nullable=False)
    salary = Column(String(100), nullable=True)
    employment_type = Column(
        Enum("full_time", "contract", "part_time", "internship"),
        nullable=False
    )
    requirements = Column(Text, nullable=False)
    responsibilities = Column(Text, nullable=False)
    publication_status = Column(Enum("active", "draft"), default="draft", nullable=False)
    is_active = Column(Boolean, default=True)
    closed_at = Column(DateTime, nullable=True)
    posted_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)

    applications = relationship("JobApplication", back_populates="job_position")


class UploadedFile(Base):
    __tablename__ = "uploaded_files"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    filename = Column(String(255), nullable=False)
    stored_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    content_type = Column(String(100), nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)


class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    job_position_id = Column(String(36), ForeignKey("job_positions.id"), nullable=False)
    applicant_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    job_title = Column(String(255), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False)
    phone_number = Column(String(50), nullable=False)
    address = Column(Text, nullable=True)
    file_id = Column(String(36), ForeignKey("uploaded_files.id"), nullable=True)
    status = Column(
        Enum("submitted", "short_listed", "hired", "rejected"),
        default="submitted",
        nullable=False
    )
    submitted_at = Column(DateTime, default=datetime.utcnow)
    interview_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)

    job_position = relationship("JobPosition", back_populates="applications")
    applicant = relationship("User", back_populates="applications")
    cv_file = relationship("UploadedFile", foreign_keys=[file_id])


class Interview(Base):
    __tablename__ = "interviews"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    application_id = Column(String(36), ForeignKey("job_applications.id"), nullable=False)
    interview_at = Column(DateTime, nullable=False)
    application_status = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class WarrantyProduct(Base):
    __tablename__ = "warranty_products"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    serial_number = Column(String(100), unique=True, nullable=False)
    product_name = Column(String(255), nullable=False)
    product_type = Column(String(100), nullable=False)
    category = Column(String(100), nullable=True)
    warranty_start = Column(DateTime, nullable=False)
    warranty_end = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)
    service_cost_min = Column(Integer, default=150000)
    service_cost_max = Column(Integer, default=350000)
    service_center_name = Column(String(255), nullable=True)
    service_center_address = Column(Text, nullable=True)
    service_center_hours = Column(String(100), nullable=True)


class ChatLog(Base):
    __tablename__ = "chat_logs"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    session_id = Column(String(36), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    user_message = Column(Text, nullable=False)
    bot_response = Column(Text, nullable=False)
    model_used = Column(String(100), default="gemini-2.0-flash")
    created_at = Column(DateTime, default=datetime.utcnow)
