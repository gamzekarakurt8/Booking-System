import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { DateTime } from "luxon";
import { randomUUID } from "node:crypto";
import { AppModule } from "../src/app.module";
import { AuthRepository } from "../src/auth/auth.repository";
import { BookingsRepository, type CreateBookingInput } from "../src/bookings/bookings.repository";

class InMemoryAuthRepository {
  private readonly users = new Map<string, {
    id: string;
    email: string;
    fullName: string;
    passwordHash: string;
  }>();

  async findByEmail(email: string) {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }

    return null;
  }

  async findById(id: string) {
    return this.users.get(id) ?? null;
  }

  async createUser(input: { email: string; fullName: string; passwordHash: string }) {
    const user = {
      id: randomUUID(),
      email: input.email,
      fullName: input.fullName,
      passwordHash: input.passwordHash,
    };

    this.users.set(user.id, user);
    return {
      ...user,
      createdAt: new Date(),
    };
  }
}

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
    const slots: Array<{ sessionStart: Date }> = [];

    for (const booking of this.bookings.values()) {
      if (booking.sessionStart >= rangeStart && booking.sessionStart < rangeEnd) {
        slots.push({ sessionStart: booking.sessionStart });
      }
    }

    return slots;
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

describe("Booking API (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AuthRepository)
      .useValue(new InMemoryAuthRepository())
      .overrideProvider(BookingsRepository)
      .useValue(new InMemoryBookingsRepository())
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("registers, returns slots, books a slot, and rejects double booking", async () => {
    const registerResponse = await request(app.getHttpServer()).post("/auth/register").send({
      email: "e2e@example.com",
      password: "password123",
      fullName: "E2E Tester",
    });

    expect(registerResponse.status).toBe(201);
    const token = registerResponse.body.token as string;

    const date = DateTime.utc().plus({ days: 3 }).toISODate() as string;
    const availableResponse = await request(app.getHttpServer())
      .get("/bookings/available")
      .query({ date, timezone: "UTC" })
      .set("Authorization", `Bearer ${token}`);

    expect(availableResponse.status).toBe(200);
    expect(availableResponse.body.slots.length).toBeGreaterThan(0);

    const firstSlot = availableResponse.body.slots[0].start as string;

    const bookingResponse = await request(app.getHttpServer())
      .post("/bookings")
      .set("Authorization", `Bearer ${token}`)
      .send({ sessionStart: firstSlot, timezone: "UTC" });

    expect(bookingResponse.status).toBe(201);

    const secondAttemptResponse = await request(app.getHttpServer())
      .post("/bookings")
      .set("Authorization", `Bearer ${token}`)
      .send({ sessionStart: firstSlot, timezone: "UTC" });

    expect(secondAttemptResponse.status).toBe(409);
  });
});
