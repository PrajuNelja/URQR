// src/pages/Table_Management/Hooks/useManagerLogin.ts

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import axios from "axios";
import { z } from "zod";

import { apiClient } from "../../../lib/apiClient";
import { useAuthStore } from "../../../lib/authStore";
import type {
  LoginFeedback,
  BackendAuthResponse,
} from "../Types/Login.types";

// ═══════════════════════════════════════════
// SCHEMA — matches Spring Boot @NotBlank String username
// ═══════════════════════════════════════════

const LoginFormSchema = z.object({
  username: z.string().trim().min(1, "Username is required"),
  password: z
    .string()
    .min(4, "Password / PIN must be at least 4 characters"),
});

export type LoginFormValues = z.infer<typeof LoginFormSchema>;

// ═══════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════

export const useManagerLogin = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [feedback, setFeedback] = useState<LoginFeedback>({
    isOpen: false,
    type: "error",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: { username: "", password: "" },
    mode: "onTouched",
  });

  const dismissFeedback = () =>
    setFeedback((prev) => ({ ...prev, isOpen: false }));

  const onSubmit = form.handleSubmit(async (data: LoginFormValues) => {
    setIsSubmitting(true);
    dismissFeedback();

    try {
      // POST /api/v1/auth/login  (baseURL already includes /api/v1)
      const response = await apiClient.post<BackendAuthResponse>(
        "/auth/login",
        {
          username: data.username.trim(),
          password: data.password, // never trim password
        }
      );

      const { accessToken, hotelId, userId, username, role } =
        response.data;

      // 1. Persist for axios request interceptor
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("tenant_id", hotelId);

      // 2. Update zustand store — matches your 3-arg signature:
      //    setAuth(user, tenantId, accessToken)
      setAuth(
        { id: userId, name: username, role },
        hotelId,
        accessToken
      );

      // 3. Success toast + route
      setFeedback({
        isOpen: true,
        type: "success",
        message: `Welcome, ${username}. Opening register…`,
      });

      setTimeout(() => {
        void navigate({ to: "/pos/billing" });
      }, 350);
    } catch (err: unknown) {
      let errorMessage = "Unable to connect to authentication server.";

      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          errorMessage = "Invalid username or password.";
        } else if (err.response?.data?.message) {
          errorMessage = String(err.response.data.message);
        } else if (err.code === "ECONNABORTED") {
          errorMessage = "Connection timed out. Please try again.";
        } else if (!err.response) {
          errorMessage = "Connection unavailable. Please try again.";
        }
      }

      setFeedback({
        isOpen: true,
        type: "error",
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  return { form, feedback, isSubmitting, onSubmit, dismissFeedback };
};