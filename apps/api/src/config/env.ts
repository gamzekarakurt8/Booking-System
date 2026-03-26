import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1)
    .default("postgresql://postgres:postgres@localhost:5432/booking_system"),
  JWT_SECRET: z.string().min(16).default("replace-with-a-long-secret"),
  API_PORT: z.coerce.number().int().positive().default(4000),
  WEB_ORIGIN: z.string().url().default("http://localhost:3000"),
});

export const env = envSchema.parse(process.env);
