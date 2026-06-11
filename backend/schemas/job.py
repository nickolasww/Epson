from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class JobPositionCreate(BaseModel):
    title: str
    location: str
    slug: str
    department: str
    salary: Optional[str] = None
    employment_type: str
    requirements: str
    responsibilities: str
    publication_status: str = "draft"
    is_active: bool = True
    closed_at: Optional[str] = None


class JobPositionUpdate(BaseModel):
    title: Optional[str] = None
    location: Optional[str] = None
    slug: Optional[str] = None
    department: Optional[str] = None
    salary: Optional[str] = None
    employment_type: Optional[str] = None
    requirements: Optional[str] = None
    responsibilities: Optional[str] = None
    publication_status: Optional[str] = None
    is_active: Optional[bool] = None
    closed_at: Optional[str] = None


class ApplicationStatusUpdate(BaseModel):
    status: Optional[str] = None
    interview_at: Optional[str] = None


class InterviewCreate(BaseModel):
    application_id: str
    interview_at: str
    application_status: Optional[str] = None
