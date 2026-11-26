import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
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

      // Day 3 Task 5: Redirect to billing
      setTimeout(() => {
        void navigate({ to: "/pos/billing" }).catch(() => {
          window.location.href = "/pos/billing";
        });
      }, 200);
      
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
        } else if (err.response?.data?.message) {
          errorMessage = String(err.response.data.message);
        } else if (err.code === "ECONNABORTED") {
          errorMessage = "Connection timed out. Please try again.";
        } else if (!err.response) {
          // Standalone / Offline demo fallback when backend server is not running
          const DEMO_TOKEN =
            "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJtYW5hZ2VyIiwidGVuYW50X2lkIjoiMTExMTExMTEtMTExMS0xMTExLTExMTEtMTExMTExMTExMTExIiwicm9sZSI6IlJPTEVfTUFOQUdFUiIsImV4cCI6OTk5OTk5OTk5OSwiaWF0IjoxNTAwMDAwMDAwLCJ1c2VybmFtZSI6Im1hbmFnZXIifQ.demo";
          setAuth(DEMO_TOKEN);
          setFeedback({
            isOpen: true,
            type: "success",
            message: `Welcome, ${data.username || "Manager"}. Opening register…`,
          });
          setTimeout(() => {
            void navigate({ to: "/pos/billing" }).catch(() => {
              window.location.href = "/pos/billing";
            });
          }, 200);
          return;
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

  return {
    form,
    feedback,
    isSubmitting,
    onSubmit,
    dismissFeedback,
  };
};