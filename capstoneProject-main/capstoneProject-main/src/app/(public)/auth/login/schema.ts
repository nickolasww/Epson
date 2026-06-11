import { z } from "zod";

/**
 * Sanitize input to prevent XSS and SQL injection patterns
 */
const sanitizeString = (str: string) => {
  return str
    .trim()
    .replace(/[<>"'`]/g, '') // Remove potential XSS characters
    .replace(/[\x00-\x1F\x7F]/g, ''); // Remove control characters
};

/**
 * Validate email format and sanitize
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
    { message: "Input mengandung karakter yang tidak valid" }
  );

/**
 * Validate password with security checks
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
  .max(128, { message: "Password terlalu panjang" })
  // Check for SQL injection patterns
  .refine(
    (pass) => !/('|"|--|;|xp_|sp_|exec|execute|select|insert|update|delete|drop|create|alter)/i.test(pass),
    { message: "Password mengandung karakter yang tidak diperbolehkan" }
  );

export const LoginFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type TLoginFormData = z.infer<typeof LoginFormSchema>;
