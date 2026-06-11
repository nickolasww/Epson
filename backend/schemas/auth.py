from pydantic import BaseModel, EmailStr
from typing import Optional


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    username: str
    fullname: str
    email: str
    password: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class VerifyOtpRequest(BaseModel):
    email: str
    otp_code: str


class ResendOtpRequest(BaseModel):
    email: str


class ForgotPasswordRequest(BaseModel):
    email: str
    redirect_url: Optional[str] = None
    recaptcha_token: Optional[str] = None


class ResetPasswordRequest(BaseModel):
    token: str
    password: str
    confirm_password: str


class VerifyResetTokenRequest(BaseModel):
    token: str


class UpdateProfileRequest(BaseModel):
    Fullname: Optional[str] = None
    username: Optional[str] = None
    email: Optional[str] = None


class UpdatePasswordRequest(BaseModel):
    password: str


class SSOLoginRequest(BaseModel):
    access_token: str


class SSORegisterRequest(BaseModel):
    access_token: str
    username: str
    phone_number: str
