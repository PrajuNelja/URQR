import type {
  ChangeEventHandler,
  FormEventHandler,
} from "react";
import type { NotificationType } from "../../../components/Notification/Notification.types";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginFeedback {
  isOpen: boolean;
  type: NotificationType;
  message: string;
}

export interface ManagerLoginFormState extends LoginCredentials {
  feedback: LoginFeedback;
  isLoading: boolean;
  onUsernameChange: ChangeEventHandler<HTMLInputElement>;
  onPasswordChange: ChangeEventHandler<HTMLInputElement>;
  onKeypadDigit: (digit: string) => void;
  onKeypadBackspace: () => void;
  onKeypadClear: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  dismissFeedback: () => void;
}
