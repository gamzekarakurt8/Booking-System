import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { and, eq, gte, lt } from "drizzle-orm";
import { DatabaseService } from "../database/database.service";
import { bookings } from "../database/schema";

export type CreateBookingInput = {
  userId: string;
  sessionStart: Date;
  sessionEnd: Date;
  durationMinutes: number;
  timezone: string;
};

@Injectable()
export class BookingsRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findBookedSlots(rangeStart: Date, rangeEnd: Date) {
    return this.databaseService.db
      .select({ sessionStart: bookings.sessionStart })
      .from(bookings)
      .where(and(gte(bookings.sessionStart, rangeStart), lt(bookings.sessionStart, rangeEnd)));
  }

  async findBookingBySessionStart(sessionStart: Date) {
    const [booking] = await this.databaseService.db
      .select({ id: bookings.id })
      .from(bookings)
      .where(eq(bookings.sessionStart, sessionStart))
      .limit(1);

    return booking ?? null;
  }

  async createBooking(input: CreateBookingInput) {
    const [booking] = await this.databaseService.db
      .insert(bookings)
      .values({
        userId: input.userId,
        sessionStart: input.sessionStart,
        sessionEnd: input.sessionEnd,
        durationMinutes: input.durationMinutes,
        timezone: input.timezone,
      })
      .returning();

    if (!booking) {
      throw new InternalServerErrorException("Failed to create booking");
    }

    return booking;
  }
}
