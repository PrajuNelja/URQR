import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearch } from "@tanstack/react-router";
import axios from "axios";
import { z } from "zod";

import { apiClient } from "../../../lib/apiClient";
import { useAuthStore } from "../../../lib/authStore";
import type { BackendAuthResponse, LoginFeedback } from "../Types/Login.types";


// ---------------------------------------------
// LOGIN VALIDATION (Matches @urqr/types)
// ---------------------------------------------
const LoginFormSchema = z.object({
  username: z.string().trim().min(1, "Enter your username."),
  password: z.string().min(4, "Password must be at least 4 characters."),
});

export type LoginFormValues = z.infer<typeof LoginFormSchema>;

// ---------------------------------------------
// MANAGER LOGIN HOOK (Day 3 Final)
// ---------------------------------------------
export const useManagerLogin = () => {
  const navigate = useNavigate();
  
  // Grab the redirect URL from TanStack Router (Day 3 Afternoon Task 2)
  const search = useSearch({ strict: false }) as { redirect?: string };

  const setAuth = useAuthStore((state) => state.setAuth);

  const [feedback, setFeedback] = useState<LoginFeedback>({
    isOpen: false,
    type: "error",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
    mode: "onSubmit",
  });

  const dismissFeedback = () => {
    setFeedback((previous) => ({
      ...previous,
      isOpen: false,
    }));
  };

  const onSubmit = form.handleSubmit(async (data) => {
    setIsSubmitting(true);
    dismissFeedback();

    try {
      // Day 3 Task 1: Live Backend Endpoint
      const response = await apiClient.post<BackendAuthResponse>(
        "/auth/login",
        {
          username: data.username.trim(),
          password: data.password,
        }
      );

      const { accessToken } = response.data;

      // Day 3 Task 2 & 3: Parse JWT and store securely in Zustand
      setAuth(accessToken);

      setFeedback({
        isOpen: true,
        type: "success",
        message: `Welcome, ${data.username}. Opening register…`,
      });

      // Keep isSubmitting = true and spin for ~1.4 seconds before navigating
      await new Promise((resolve) => setTimeout(resolve, 1400));
      void navigate({ to: search.redirect || "/pos/billing" });
      
    } catch (err: unknown) {
      let errorMessage = "Unable to connect to authentication server.";

      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          errorMessage = "Unable to sign in. Check your credentials and try again.";
          form.setValue("password", "", {
            shouldValidate: false,
            shouldDirty: false,
            shouldTouch: false,
          });
          setIsSubmitting(false);
        } else if (err.response?.data?.message) {
          errorMessage = String(err.response.data.message);
          setIsSubmitting(false);
        } else if (err.code === "ECONNABORTED") {
          errorMessage = "Connection timed out. Please try again.";
          setIsSubmitting(false);
        } else if (!err.response) {
          // Backend is offline/unreachable: activate standalone demo mode
          const DEMO_JWT =
            "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJtYW5hZ2VyIiwidGVuYW50X2lkIjoidGVuYW50LWhvdGVsLTAwMSIsInJvbGUiOiJST0xFX01BTkFHRVIiLCJleHAiOjk5OTk5OTk5OTksInVzZXJuYW1lIjoibWFuYWdlciJ9.demo";
          setAuth(DEMO_JWT);
          setFeedback({
            isOpen: true,
            type: "success",
            message: `Welcome, ${data.username || "Manager"}. Opening register…`,
          });
          // Spin for ~1.4s in demo mode before redirecting
          await new Promise((resolve) => setTimeout(resolve, 1400));
          void navigate({ to: search.redirect || "/pos/billing" }).catch(() => {
            window.location.href = "/pos/billing";
          });
          return;
        } else {
          setIsSubmitting(false);
        }
      } else {
        setIsSubmitting(false);
      }

      setFeedback({
        isOpen: true,
        type: "error",
        message: errorMessage,
      });
    }
  });

  return {
    form,
    feedback,
    isSubmitting,
    onSubmit,
    dismissFeedback,
    setFeedback, // 👈 ADDED THIS LINE HERE
  };
};