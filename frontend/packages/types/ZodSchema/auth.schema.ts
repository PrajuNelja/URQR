import { z } from "zod";

export const LoginRequestSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(1),
  })
  .strict();

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const AuthResponseSchema = z
  .object({
    accessToken: z.string().min(1),
    user: z
      .object({
        id: z.string().min(1),
        email: z.string().email(),
      })
      .strict(),
  })
  .strict();

export type AuthResponse = z.infer<typeof AuthResponseSchema>;
