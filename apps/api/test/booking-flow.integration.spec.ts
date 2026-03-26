import { DateTime } from "luxon";
import { randomUUID } from "node:crypto";
import { BookingsService } from "../src/bookings/bookings.service";
import type { BookingsRepository, CreateBookingInput } from "../src/bookings/bookings.repository";

class InMemoryBookingsRepository {
  private readonly bookings = new Map<number, {
    id: string;
    userId: string;
    sessionStart: Date;
    sessionEnd: Date;
    durationMinutes: number;
    timezone: string;
    status: "confirmed";
    createdAt: Date;
  }>();

  async findBookedSlots(rangeStart: Date, rangeEnd: Date) {
    const rows: Array<{ sessionStart: Date }> = [];

    for (const booking of this.bookings.values()) {
      if (booking.sessionStart >= rangeStart && booking.sessionStart < rangeEnd) {
        rows.push({ sessionStart: booking.sessionStart });
      }
    }

    return rows;
  }

  async findBookingBySessionStart(sessionStart: Date) {
    const key = sessionStart.getTime();
    const booking = this.bookings.get(key);
    return booking ? { id: booking.id } : null;
  }

  async createBooking(input: CreateBookingInput) {
    const key = input.sessionStart.getTime();

    if (this.bookings.has(key)) {
      throw { code: "23505" };
    }

    const booking = {
      id: randomUUID(),
      userId: input.userId,
      sessionStart: input.sessionStart,
      sessionEnd: input.sessionEnd,
      durationMinutes: input.durationMinutes,
      timezone: input.timezone,
      status: "confirmed" as const,
      createdAt: new Date(),
    };

    this.bookings.set(key, booking);
    return booking;
  }
}

describe("Booking flow integration", () => {
  it("marks a slot unavailable immediately after booking", async () => {
    const repository = new InMemoryBookingsRepository();
    const service = new BookingsService(repository as unknown as BookingsRepository);

    const user = {
      id: randomUUID(),
      email: "flow@test.com",
      fullName: "Flow Test",
    };

    const date = DateTime.utc().plus({ days: 2 }).toISODate() as string;

    const before = await service.getAvailableSessions({ date, timezone: "UTC" });
    expect(before.slots.length).toBeGreaterThan(0);

    const selectedSlot = before.slots[0];
    expect(selectedSlot).toBeDefined();
    await service.bookSession(
      {
        sessionStart: selectedSlot!.start,
        timezone: "UTC",
      },
      user,
    );

    const after = await service.getAvailableSessions({ date, timezone: "UTC" });
    expect(after.slots.map((slot) => slot.start)).not.toContain(selectedSlot!.start);
  });
});
