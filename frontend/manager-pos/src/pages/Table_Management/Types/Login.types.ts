import type {
  ChangeEventHandler,
  FormEventHandler,
} from "react";
import type { NotificationType } from "../../../components/Notification/Notification.types";

export interface LoginCredentials {
  userName: string;
  password: string;
}

export interface LoginFeedback {
  isOpen: boolean;
  type: NotificationType;
  message: string;
}

export interface ManagerLoginFormState extends LoginCredentials {
  feedback: LoginFeedback;
  onUserNameChange: ChangeEventHandler<HTMLInputElement>;
  onPasswordChange: ChangeEventHandler<HTMLInputElement>;
  onSubmit: FormEventHandler<HTMLFormElement>;
  dismissFeedback: () => void;
}
