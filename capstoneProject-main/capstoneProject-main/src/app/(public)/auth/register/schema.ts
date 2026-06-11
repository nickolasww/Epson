import { z } from "zod";

/**
 * Sanitize input to prevent XSS and injection attacks
 */
const sanitizeString = (str: string) => {
  return str
    .trim()
    .replace(/[<>"'`]/g, '') // Remove potential XSS characters
    .replace(/[\x00-\x1F\x7F]/g, ''); // Remove control characters
};

/**
 * Username validation with security checks
 */
const usernameSchema = z
   .string({
    error: (issue) => {
      if (issue.input === undefined) {
        return "Username tidak boleh kosong";
      }
    },
  })
  .trim()
  .min(1, { message: "Username tidak boleh kosong" })
  .min(3, { message: "Username minimal 3 karakter" })
  .max(50, { message: "Username maksimal 50 karakter" })
  .regex(/^[a-zA-Z0-9_.-]+$/, {
    message: "Username hanya boleh mengandung huruf, angka, underscore, titik, dan dash",
  })
  .transform(sanitizeString)
  // Prevent SQL injection patterns
  .refine(
    (username) => !/('|"|--|;|\*|\/\*|\*\/|xp_|sp_|exec|execute|select|insert|update|delete|drop|create|alter|union)/i.test(username),
    { message: "Username mengandung karakter yang tidak diperbolehkan" }
  );

/**
 * Full name validation
 */
const fullnameSchema = z
  .string({
    error: (issue) => {
      if (issue.input === undefined) {
        return "FullName tidak boleh kosong";
      }
    },
  })
  .trim()
  .min(1, { message: "Nama lengkap tidak boleh kosong" })
  .min(5, { message: "Nama lengkap minimal 5 karakter" })
  .max(100, { message: "Nama lengkap maksimal 100 karakter" })
  .regex(/^[a-zA-Z\s.'-]+$/, {
    message: "Nama hanya boleh mengandung huruf, spasi, titik, apostrof, dan dash",
  })
  .transform(sanitizeString)
  // Prevent SQL injection patterns
  .refine(
    (name) => !/('|"|--|;|\*|\/\*|\*\/|xp_|sp_|exec|execute|select|insert|update|delete|drop|create|alter)/i.test(name),
    { message: "Nama mengandung karakter yang tidak diperbolehkan" }
  );

/**
 * Email validation with security checks
 */
const emailSchema = z
  .string({
    error: (issue) => {
      if (issue.input === undefined) {
        return "Email tidak boleh kosong";
      }
    },
  })
  .trim()
  .min(1, { message: "Email tidak boleh kosong" })
  .max(255, { message: "Email terlalu panjang" })
  .refine((val) => z.email().safeParse(val).success, {
    error: "Format email tidak valid",
  })
  .regex(/^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
    message: "Email mengandung karakter yang tidak diperbolehkan",
  })
  .transform(sanitizeString)
  // Blacklist SQL injection patterns
  .refine(
    (email) => !/('|"|--|;|\*|\/\*|\*\/|xp_|sp_|exec|execute|select|insert|update|delete|drop|create|alter|union)/i.test(email),
    { message: "Email mengandung karakter yang tidak valid" }
  );

/**
 * Password validation with strength requirements
 */
const passwordSchema = z
  .string({
    error: (issue) => {
      if (issue.input === undefined) {
        return "Password tidak boleh kosong";
      }
    },
  })
  .min(1, { message: "Password tidak boleh kosong" })
  .min(8, { message: "Password minimal 8 karakter" })
  .max(128, { message: "Password maksimal 128 karakter" })
  // Check password strength
  .regex(/[a-z]/, { message: "Password harus mengandung huruf kecil" })
  .regex(/[A-Z]/, { message: "Password harus mengandung huruf besar" })
  .regex(/[0-9]/, { message: "Password harus mengandung angka" })
  .regex(/[!@#$%^&*(),.?":{}|<>]/, { message: "Password harus mengandung karakter spesial" })
  // Prevent SQL injection patterns
  .refine(
    (pass) => !/('|"|--|;|xp_|sp_|exec|execute|select|insert|update|delete|drop|create|alter)/i.test(pass),
    { message: "Password mengandung karakter yang tidak diperbolehkan" }
  )
  // Prevent common weak passwords
  .refine(
    (pass) => !/(password|123456|qwerty|admin|letmein|welcome)/i.test(pass),
    { message: "Password terlalu umum, gunakan kombinasi yang lebih kuat" }
  );

export const RegisterFormSchema = z.object({
  username: usernameSchema,
  fullname: fullnameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export type TRegisterFormData = z.infer<typeof RegisterFormSchema>;
