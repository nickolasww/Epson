import type { TUserItem } from "../user/type";

// Company type
export type TCompany = {
  id: string;
  name: string;
  email: string;
  address: string;
  phone_number: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

// Permission type
export type TPermission = {
  id: string;
  name: string;
  slug: string;
  description: string;
};

// Permission with group
export type TPermissionWithGroup = TPermission & {
  roles?: unknown[];
  permission_group: {
    id: string;
    name: string;
    slug: string;
    description: string;
    permissions: unknown[];
  };
};

// Role type for auth
export type TAuthRole = {
  id: string;
  name: string;
  slug: string;
  permissions: TPermission[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

// Project user assignment type
export type TProjectUser = {
  project_id: string;
  assignment_type: string;
  team_type: string;
};

// User type for login response
export type TLoginUser = {
  id: string;
  fullname: string;
  username: string;
  email: string;
  position: string;
  task: string;
  company: TCompany;
  role: TAuthRole | null;
  employee_number: string;
  phone_number: string;
  is_active: boolean;
  created_at: string;
  project_users: TProjectUser[];
};

// Token type
export type TAuthToken = {
  access_token: string;
  access_token_expires_in: string;
  refresh_token: string;
  refresh_token_expires_in: string;
};

// Login request
export type TLoginParam = {
  email: string;
  password: string;
};

// Login response
export type TLoginResponse = {
  message: string;
  data: {
    user: TLoginUser;
    token: TAuthToken;
  };
};

// User profile type (for /me endpoint)
export type TUserProfile = {
  id: string;
  username: string;
  Fullname: string;
  email: string;
  role: string;
};

export type TUserProfileRequest = {
  Fullname?: string;
  username?: string;
  email?: string;
};

export type TUpdatePasswordRequest = {
  password: string;
};

// User profile response
export type TUserProfileResponse = {
  message: string;
  users: TUserProfile;
};

// Refresh token request
export type TRefreshTokenParam = {
  refresh_token: string;
};

// Refresh token response
export type TRefreshTokenResponse = {
  message: string;
  data: {
    user: {
      id: string;
      fullname: string;
      email: string;
      roles: unknown[];
      phone_number: string;
    };
    token: TAuthToken;
  };
};

export type TLoginOidcParam = {
  code: string;
};

export type TLoginOidcResponse = {
  data: {
    access_token: string;
    refresh_token: string;
    user: TUserItem;
  };
};

// SSO Login request
export type TSSOLoginParam = {
  access_token: string;
};

// SSO Login response
export type TSSOLoginResponse = {
  message: string;
  data: {
    user: TLoginUser;
    token: TAuthToken;
    is_pending_registration: boolean;
  };
};

// SSO Register request
export type TSSORegisterParam = {
  access_token: string;
  username: string;
  phone_number: string;
};

// Register request
export type TRegisterParam = {
  username: string;
  fullname: string;
  email: string;
  password: string;
};

// Verify OTP request
export type TVerifyOtpParam = {
  email: string;
  otp_code: string;
};

// Resend OTP request
export type TResendOtpParam = {
  email: string;
};

// Forgot Password request
export type TForgotPasswordParam = {
  email: string;
  redirect_url: string;
  recaptcha_token: string;
};

// Reset Password request
export type TResetPasswordParam = {
  token: string;
  password: string;
  confirm_password: string;
};

// Verify Forgot Password Token request
export type TVerifyForgotPasswordTokenParam = {
  token: string;
};
