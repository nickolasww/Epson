import { api } from "@/libs/axios/api";
import type {
  TLoginParam,
  TLoginResponse,
  TRefreshTokenResponse,
  TRegisterParam,
  TSSOLoginParam,
  TSSOLoginResponse,
  TSSORegisterParam,
  TUserProfileResponse,
  TResendOtpParam,
  TVerifyOtpParam,
  TForgotPasswordParam,
  TResetPasswordParam,
  TVerifyForgotPasswordTokenParam,
  TRefreshTokenParam,
  TUpdatePasswordRequest,
  TUserProfileRequest,
} from "./type";
import type { TDefaultResponse } from "@/commons/types/response";

/**
 * Login with identifier (username or email) and password
 * POST /auth/basic
 */
export const postLogin = async (
  payload: TLoginParam,
): Promise<TLoginResponse> => {
  const { data } = await api({
    url: "/auth/login",
    method: "POST",
    data: payload,
  });
  return data;
};

/**
 * Get current user session from users/me and profile
 * GET /users/me
 */
export const getMe = async (): Promise<TUserProfileResponse> => {
  const { data } = await api({
    url: "/users/me",
    method: "GET",
  });
  return data;
};

export const UpdateProfile = async (
  payload: TUserProfileRequest,
): Promise<TUserProfileResponse> => {
  const { data } = await api({
    url: "/users/me",
    method: "PATCH",
    data: payload,
  });
  return data;
};

export const UpdatePassword = async (
  payload: TUpdatePasswordRequest,
): Promise<TUserProfileResponse> => {
  const { data } = await api({
    url: "/users/me",
    method: "PATCH",
    data: payload,
  });
  return data;
};

/**
 * Refresh access token using refresh token
 * POST /auth/refresh-token
 */
export const postRefreshToken = async (
  payload: TRefreshTokenParam,
): Promise<TRefreshTokenResponse> => {
  const { data } = await api({
    url: "/auth/refresh-token",
    method: "POST",
    data: payload,
  });
  return data;
};

/**
 * Login with SSO (Auth0) access token
 * POST /auth/sso
 */
export const postSSOLogin = async (
  payload: TSSOLoginParam,
): Promise<TSSOLoginResponse> => {
  const { data } = await api({
    url: "/auth/sso",
    method: "POST",
    data: payload,
  });
  return data;
};

/**
 * Register with SSO (Auth0) - complete pending registration
 * POST /auth/sso/register
 */
export const postSSORegister = async (
  payload: TSSORegisterParam,
): Promise<TDefaultResponse> => {
  const { data } = await api({
    url: "/auth/sso/register",
    method: "POST",
    data: payload,
  });
  return data;
};

/**
 * Register new user
 * POST /auth/register
 */
export const postRegister = async (
  payload: TRegisterParam,
): Promise<TDefaultResponse> => {
  const { data } = await api({
    url: "/auth/register",
    method: "POST",
    data: payload,
  });
  return data;
};

/**
 * Verify OTP
 * POST /auth/verify-otp
 */
export const postVerifyOtp = async (
  payload: TVerifyOtpParam,
): Promise<TDefaultResponse> => {
  const { data } = await api({
    url: "/otp/verify",
    method: "POST",
    data: payload,
  });
  return data;
};

/**
 * Resend OTP
 * POST /auth/resend-otp
 */
export const postResendOtp = async (
  payload: TResendOtpParam,
): Promise<TDefaultResponse> => {
  const { data } = await api({
    url: "/otp/resend",
    method: "POST",
    data: payload,
  });
  return data;
};

/**
 * Forgot Password
 * POST /auth/forgot-password
 */
export const postForgotPassword = async (
  payload: TForgotPasswordParam,
): Promise<TDefaultResponse> => {
  const { data } = await api({
    url: "/forgot-password/request",
    method: "POST",
    data: payload,
  });
  return data;
};

/**
 * Reset Password
 * POST /forgot-password/reset
 */
export const postResetPassword = async (
  payload: TResetPasswordParam,
): Promise<TDefaultResponse> => {
  const { data } = await api({
    url: "/forgot-password/reset",
    method: "POST",
    data: payload,
  });
  return data;
};

/**
 * Verify Forgot Password Token
 * POST /forgot-password/verify
 */
export const postVerifyForgotPasswordToken = async (
  payload: TVerifyForgotPasswordTokenParam,
): Promise<TDefaultResponse> => {
  const { data } = await api({
    url: "/forgot-password/verify",
    method: "POST",
    data: payload,
  });
  return data;
};
