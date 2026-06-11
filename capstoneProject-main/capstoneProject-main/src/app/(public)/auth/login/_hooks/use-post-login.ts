import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { notification } from "antd";
import { useSession } from "@/app/_components/providers/session";
import type { TLoginFormData } from "../schema";

interface LoginResult {
  success: boolean;
  user?: any;
  error?: string;
}

export const usePostLogin = (): UseMutationResult<
  LoginResult,
  unknown,
  TLoginFormData,
  unknown
> => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useSession();

  return useMutation({
    mutationKey: ["post-login"],
    mutationFn: async (payload: TLoginFormData) => {
      return await login(payload.email, payload.password);
    },
    onSuccess: (result) => {
      if (result.success) {
        notification.success({
          message: "Login Berhasil",
          description: "Selamat datang kembali!",
          placement: "topRight",
        });

        const user = result.user;

        setTimeout(() => {
          if (user?.role === "admin" || user?.role === "super_admin") {
            navigate("/dashboard", { replace: true });
          } else {
            const from = (location.state as any)?.from || "/";
            navigate(from, { replace: true });
          }
        }, 1000);
      } else {
        const errorMsg = result.error || "Login gagal";
        notification.error({
          message: "Login Gagal",
          description: errorMsg,
          placement: "topRight",
        });
      }
    },
    onError: () => {
      const errorMsg = "Terjadi kesalahan saat login";
      notification.error({
        message: "Error",
        description: errorMsg,
        placement: "topRight",
      });
    },
  });
};
