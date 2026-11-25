
import { useCallback, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import type {
  ChangeEventHandler,
  FormEventHandler,
} from "react";

import { LOGIN_CREDENTIALS } from "../Config/Login.config";

import type {
  LoginCredentials,
  LoginFeedback,
  ManagerLoginFormState,
} from "../Types/Login.types";

export const useManagerLogin = (): ManagerLoginFormState => {
  // TanStack Router navigation
  const navigate = useNavigate();

  const [values, setValues] = useState<LoginCredentials>({
    userName: "",
    password: "",
  });

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

  const onUserNameChange: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    setValues((current) => ({
      ...current,
      userName: event.target.value,
    }));
    dismissFeedback();
  };

  const onPasswordChange: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    setValues((current) => ({
      ...current,
      password: event.target.value,
    }));
    dismissFeedback();
  };

  const onSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    // Validate login credentials
    const isValid =
      values.userName === LOGIN_CREDENTIALS.userName &&
      values.password === LOGIN_CREDENTIALS.password;

    setFeedback({
      isOpen: true,
      type: isValid ? "success" : "error",
      message: isValid
        ? "Login successful."
        : "Login failed. Please check your user name and password.",
    });

    // Navigate only after successful login
    if (isValid) {
      void navigate({
        to: "/dashboard",
      });
    }
  };

  return {
    ...values,
    feedback,
    onUserNameChange,
    onPasswordChange,
    onSubmit,
    dismissFeedback,
  };
};
