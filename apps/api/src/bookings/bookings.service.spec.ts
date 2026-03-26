import { ConflictException } from "@nestjs/common";
import { DateTime } from "luxon";
import { BookingsService } from "./bookings.service";
import type { BookingsRepository } from "./bookings.repository";

describe("BookingsService", () => {
  const user = {
    id: "2f3df859-b16c-49f4-b726-c84d2634df13",
    email: "test@example.com",
    fullName: "Unit Test",
  };

  it("filters out booked slots in available sessions", async () => {
    const tomorrow = DateTime.utc().plus({ days: 1 }).toISODate() as string;
    const nineAmUtc = DateTime.fromISO(`${tomorrow}T09:00:00`, { zone: "UTC" }).toJSDate();

    const repositoryMock: Pick<BookingsRepository, "findBookedSlots" | "createBooking" | "findBookingBySessionStart"> = {
      findBookedSlots: jest.fn().mockResolvedValue([{ sessionStart: nineAmUtc }]),
      createBooking: jest.fn(),
      findBookingBySessionStart: jest.fn(),
    };

    const service = new BookingsService(repositoryMock as BookingsRepository);
    const result = await service.getAvailableSessions({ date: tomorrow, timezone: "UTC" });

    expect(result.slots).toHaveLength(7);
    expect(result.slots.some((slot) => slot.start.includes("09:00:00"))).toBe(false);
  });

  it("throws conflict when repository surfaces unique constraint violation", async () => {
    const tomorrow = DateTime.utc().plus({ days: 1 }).toISODate() as string;

    const repositoryMock: Pick<BookingsRepository, "findBookedSlots" | "createBooking" | "findBookingBySessionStart"> = {
      findBookedSlots: jest.fn(),
      createBooking: jest.fn().mockRejectedValue({ code: "23505" }),
      findBookingBySessionStart: jest.fn().mockResolvedValue(null),
    };

    const service = new BookingsService(repositoryMock as BookingsRepository);

    await expect(
      service.bookSession(
        {
          sessionStart: `${tomorrow}T10:00:00+00:00`,
          timezone: "UTC",
        },
        user,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
