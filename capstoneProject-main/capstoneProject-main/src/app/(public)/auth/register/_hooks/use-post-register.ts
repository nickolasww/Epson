import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { notification } from "antd";
import { postRegister } from "@/api/auth/api";
import type { TRegisterParam } from "@/api/auth/type";
import type { TDefaultResponse } from "@/commons/types/response";

export const usePostRegister = (): UseMutationResult<
  TDefaultResponse,
  unknown,
  TRegisterParam,
  unknown
> => {
  const navigate = useNavigate();

  return useMutation({
    mutationKey: ["post-register"],
    mutationFn: async (payload: TRegisterParam) => {
      return await postRegister(payload);
    },

    onSuccess: (response) => {
      notification.success({
        message: "Registrasi Berhasil",
        description:
          response.message ||
          "Akun Anda telah berhasil dibuat. Silakan login.",
        placement: "topRight",
      });

      setTimeout(() => {
        navigate("/auth/login");
      }, 1000);
    },

    onError: (error: unknown) => {
      const err = error as {
        response?: {
          data?: {
            message?: string | Record<string, string>;
          };
        };
        message?: string;
      };

      let errorMsg = "Registrasi gagal. Silakan coba lagi.";

      const backendMessage = err?.response?.data?.message;

      if (typeof backendMessage === "string") {
        errorMsg = backendMessage;
      } else if (
        typeof backendMessage === "object" &&
        backendMessage !== null
      ) {
        // ambil semua error dari object backend
        errorMsg = Object.values(backendMessage).join(", ");
      } else if (err.message) {
        errorMsg = err.message;
      }

      notification.error({
        message: "Registrasi Gagal",
        description: errorMsg,
        placement: "topRight",
      });
    },
  });
};