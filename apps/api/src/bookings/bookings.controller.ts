import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { availableSessionsQuerySchema, bookSessionSchema } from "@booking/shared";
import { CurrentUser, type AuthenticatedUser } from "../common/current-user.decorator";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { BookingsService } from "./bookings.service";

@Controller("bookings")
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get("available")
  getAvailableSessions(
    @Query(new ZodValidationPipe(availableSessionsQuerySchema))
    query: ReturnType<typeof availableSessionsQuerySchema.parse>,
  ) {
    return this.bookingsService.getAvailableSessions(query);
  }

  @Post()
  bookSession(
    @Body(new ZodValidationPipe(bookSessionSchema)) body: ReturnType<typeof bookSessionSchema.parse>,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.bookingsService.bookSession(body, user);
  }
}
