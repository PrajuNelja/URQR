import { useCallback, useState } from "react";
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
    setFeedback((current) => ({ ...current, isOpen: false }));
  }, []);

  const onUserNameChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setValues((current) => ({ ...current, userName: event.target.value }));
    dismissFeedback();
  };

  const onPasswordChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setValues((current) => ({ ...current, password: event.target.value }));
    dismissFeedback();
  };

  const onSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
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
