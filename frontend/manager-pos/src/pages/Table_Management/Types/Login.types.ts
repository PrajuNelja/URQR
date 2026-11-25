// src/pages/Table_Management/Types/Login.types.ts

import type { NotificationType } from "../../../components/Notification/Notification.types";

export interface LoginFeedback {
  isOpen: boolean;
  type: NotificationType;
  message: string;
}

export interface BackendAuthResponse {
  accessToken: string;
  tokenType: string;
  hotelId: string;
  userId: string;
  username: string;
  role: string;
}