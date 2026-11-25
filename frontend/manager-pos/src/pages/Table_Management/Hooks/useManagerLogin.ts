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

// ---------------------------------------------
// LOGIN VALIDATION
// ---------------------------------------------

const LoginFormSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Enter your username."),

  password: z
    .string()
    .min(1, "Enter your password."), // never trim
});

export type LoginFormValues = z.infer<typeof LoginFormSchema>;

// ---------------------------------------------
// MANAGER LOGIN HOOK
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

  // -------------------------------------------
  // DISMISS NOTIFICATION
  // -------------------------------------------

  const dismissFeedback = () => {
    setFeedback((previous) => ({
      ...previous,
      isOpen: false,
    }));
  };

  // -------------------------------------------
  // LOGIN SUBMISSION
  // -------------------------------------------

  const onSubmit = form.handleSubmit(async (data) => {
    setIsSubmitting(true);
    dismissFeedback();

    try {
      // API request
      const response = await apiClient.post<BackendAuthResponse>(
        "/auth/login",
        {
          username: data.username.trim(),
          password: data.password,
        }
      );

      const {
        accessToken,
        hotelId,
        userId,
        username,
        role,
      } = response.data;

      // Store authentication token
      localStorage.setItem("access_token", accessToken);

      // Preserve backend hotel context for authenticated requests
      localStorage.setItem("tenant_id", hotelId);

      // Update Zustand authentication store
      setAuth(
        {
          id: userId,
          name: username,
          role,
        },
        hotelId,
        accessToken
      );

      // Success notification
      setFeedback({
        isOpen: true,
        type: "success",
        message: `Welcome, ${username}. Opening register…`,
      });

      // Navigate to billing page
      setTimeout(() => {
        void navigate({
          to: "/pos/billing",
        });
      }, 350);
    } catch (err: unknown) {
      let errorMessage =
        "Unable to connect to authentication server.";

      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          errorMessage =
            "Unable to sign in. Check your credentials and try again.";

          // Keep Manager ID, clear only password
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

  return {
    form,
    feedback,
    isSubmitting,
    onSubmit,
    dismissFeedback,
  };
};