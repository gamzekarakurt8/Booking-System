import { z } from "zod";

export const authCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(64),
});

export const registerSchema = authCredentialsSchema.extend({
  fullName: z.string().min(2).max(80),
});

export const authResponseSchema = z.object({
  token: z.string().min(1),
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    fullName: z.string().min(1),
  }),
});

export type AuthCredentialsInput = z.infer<typeof authCredentialsSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
