import { useCallback, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import type {
  ChangeEventHandler,
  FormEventHandler,
} from "react";

import { apiClient } from "../../../lib/apiClient";
import { useAuthStore } from "../../../lib/authStore";

import type {
  LoginCredentials,
  LoginFeedback,
  ManagerLoginFormState,
} from "../Types/Login.types";

export const useManagerLogin = (): ManagerLoginFormState => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [values, setValues] = useState<LoginCredentials>({
    username: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [feedback, setFeedback] = useState<LoginFeedback>({
    isOpen: false,
    type: "error",
    message: "",
  });

  const dismissFeedback = useCallback(() => {
    setFeedback((current) => ({
      ...current,
      isOpen: false,
    }));
  }, []);

  const onUsernameChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setValues((current) => ({
      ...current,
      username: event.target.value,
    }));
    dismissFeedback();
  };

  const onPasswordChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setValues((current) => ({
      ...current,
      password: event.target.value,
    }));
    dismissFeedback();
  };

  const onKeypadDigit = useCallback((digit: string) => {
    setValues((current) => ({
      ...current,
      password: current.password + digit,
    }));
    dismissFeedback();
  }, [dismissFeedback]);

  const onKeypadBackspace = useCallback(() => {
    setValues((current) => ({
      ...current,
      password: current.password.slice(0, -1),
    }));
    dismissFeedback();
  }, [dismissFeedback]);

  const onKeypadClear = useCallback(() => {
    setValues((current) => ({
      ...current,
      password: "",
    }));
    dismissFeedback();
  }, [dismissFeedback]);

  const onSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();

    if (!values.username || !values.password) {
      setFeedback({
        isOpen: true,
        type: "error",
        message: "Please enter both username and password.",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Connect to real Spring Boot Auth API
      const response = await apiClient.post("/auth/login", {
        username: values.username,
        password: values.password,
      });

      const { token, user } = response.data;

      // Save token and hydrate store
      localStorage.setItem("access_token", token);
      if (user?.hotelId) {
        localStorage.setItem("tenant_id", user.hotelId);
      }
      setAuth(user, user?.hotelId || "default", token);

      setFeedback({
        isOpen: true,
        type: "success",
        message: "Login successful. Redirecting to billing...",
      });

      // Primary operational workflow: redirect directly to Screen 2 Billing
      void navigate({
        to: "/pos/billing",
      });
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Login failed. Please check your username and password.";

      setFeedback({
        isOpen: true,
        type: "error",
        message: errorMsg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    ...values,
    feedback,
    isLoading,
    onUsernameChange,
    onPasswordChange,
    onKeypadDigit,
    onKeypadBackspace,
    onKeypadClear,
    onSubmit,
    dismissFeedback,
  };
};
