import { z } from "zod";

export const SESSION_DURATION_MINUTES = 60;
export const WORKING_HOURS = {
  startsAt: 9,
  endsAt: 17,
} as const;

export const availableSessionsQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timezone: z.string().min(3).default("UTC"),
});

export const bookSessionSchema = z.object({
  sessionStart: z.string().datetime({ offset: true }),
  timezone: z.string().min(3),
});

export const sessionSlotSchema = z.object({
  start: z.string().datetime({ offset: true }),
  end: z.string().datetime({ offset: true }),
  durationMinutes: z.number().int().positive(),
});

export const availableSessionsResponseSchema = z.object({
  date: z.string(),
  timezone: z.string(),
  slots: z.array(sessionSlotSchema),
});

export const bookingSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  sessionStart: z.string().datetime({ offset: true }),
  sessionEnd: z.string().datetime({ offset: true }),
  durationMinutes: z.number().int().positive(),
  timezone: z.string(),
  status: z.enum(["confirmed"]),
  createdAt: z.string().datetime({ offset: true }),
});

export const bookingResponseSchema = z.object({
  booking: bookingSchema,
  message: z.string(),
});

export type AvailableSessionsQueryInput = z.infer<typeof availableSessionsQuerySchema>;
export type BookSessionInput = z.infer<typeof bookSessionSchema>;
export type SessionSlot = z.infer<typeof sessionSlotSchema>;
export type AvailableSessionsResponse = z.infer<typeof availableSessionsResponseSchema>;
export type Booking = z.infer<typeof bookingSchema>;
export type BookingResponse = z.infer<typeof bookingResponseSchema>;
