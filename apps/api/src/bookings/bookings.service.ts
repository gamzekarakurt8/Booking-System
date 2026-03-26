import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import {
  AvailableSessionsQueryInput,
  BookSessionInput,
  SESSION_DURATION_MINUTES,
  WORKING_HOURS,
} from "@booking/shared";
import { DateTime } from "luxon";
import type { AuthenticatedUser } from "../common/current-user.decorator";
import { BookingsRepository } from "./bookings.repository";

@Injectable()
export class BookingsService {
  constructor(private readonly bookingsRepository: BookingsRepository) {}

  async getAvailableSessions(query: AvailableSessionsQueryInput) {
    const generatedSlots = this.generateDailySlots(query.date, query.timezone);

    const rangeStart = generatedSlots[0]?.startUtc.toJSDate();
    const rangeEnd = generatedSlots.at(-1)?.endUtc.toJSDate();

    if (!rangeStart || !rangeEnd) {
      return {
        date: query.date,
        timezone: query.timezone,
        slots: [],
      };
    }

    const bookedRows = await this.bookingsRepository.findBookedSlots(rangeStart, rangeEnd);
    const bookedEpochMillis = new Set(bookedRows.map((row) => new Date(row.sessionStart).getTime()));

    const availableSlots = generatedSlots
      .filter((slot) => !bookedEpochMillis.has(slot.startUtc.toMillis()))
      .map((slot) => ({
        start: slot.startUtc.setZone(query.timezone).toISO({ suppressMilliseconds: true }) as string,
        end: slot.endUtc.setZone(query.timezone).toISO({ suppressMilliseconds: true }) as string,
        durationMinutes: SESSION_DURATION_MINUTES,
      }));

    return {
      date: query.date,
      timezone: query.timezone,
      slots: availableSlots,
    };
  }

  async bookSession(input: BookSessionInput, user: AuthenticatedUser) {
    const requestedStart = DateTime.fromISO(input.sessionStart, { setZone: true });

    if (!requestedStart.isValid) {
      throw new BadRequestException("Invalid sessionStart format");
    }

    const startUtc = requestedStart.toUTC().set({ second: 0, millisecond: 0 });
    const localStart = startUtc.setZone(input.timezone);

    if (localStart.minute !== 0) {
      throw new BadRequestException("Session start must be on the hour");
    }

    if (localStart.hour < WORKING_HOURS.startsAt || localStart.hour >= WORKING_HOURS.endsAt) {
      throw new BadRequestException("Selected slot is outside working hours");
    }

    if (startUtc <= DateTime.utc()) {
      throw new BadRequestException("Selected slot must be in the future");
    }

    const endUtc = startUtc.plus({ minutes: SESSION_DURATION_MINUTES });
    const existingBooking = await this.bookingsRepository.findBookingBySessionStart(startUtc.toJSDate());

    if (existingBooking) {
      throw new ConflictException("Selected slot is already booked");
    }

    try {
      const booking = await this.bookingsRepository.createBooking({
        userId: user.id,
        sessionStart: startUtc.toJSDate(),
        sessionEnd: endUtc.toJSDate(),
        durationMinutes: SESSION_DURATION_MINUTES,
        timezone: input.timezone,
      });

      return {
        message: "Session booked successfully",
        booking: {
          id: booking.id,
          userId: booking.userId,
          sessionStart: DateTime.fromJSDate(new Date(booking.sessionStart))
            .setZone(input.timezone)
            .toISO({ suppressMilliseconds: true }) as string,
          sessionEnd: DateTime.fromJSDate(new Date(booking.sessionEnd))
            .setZone(input.timezone)
            .toISO({ suppressMilliseconds: true }) as string,
          durationMinutes: booking.durationMinutes,
          timezone: booking.timezone,
          status: booking.status,
          createdAt: DateTime.fromJSDate(new Date(booking.createdAt))
            .setZone(input.timezone)
            .toISO({ suppressMilliseconds: true }) as string,
        },
      };
    } catch (error) {
      const maybePgError = error as { code?: string };

      if (maybePgError.code === "23505") {
        throw new ConflictException("This slot was just booked by another user");
      }

      throw new InternalServerErrorException("Unable to create booking");
    }
  }

  private generateDailySlots(date: string, timezone: string) {
    const baseDay = DateTime.fromISO(date, { zone: timezone });

    if (!baseDay.isValid) {
      throw new BadRequestException("Invalid date or timezone");
    }

    const slots: Array<{ startUtc: DateTime; endUtc: DateTime }> = [];

    for (let hour = WORKING_HOURS.startsAt; hour < WORKING_HOURS.endsAt; hour += 1) {
      const startLocal = baseDay.set({ hour, minute: 0, second: 0, millisecond: 0 });
      const endLocal = startLocal.plus({ minutes: SESSION_DURATION_MINUTES });

      slots.push({
        startUtc: startLocal.toUTC(),
        endUtc: endLocal.toUTC(),
      });
    }

    return slots;
  }
}
