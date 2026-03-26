import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { BookingsModule } from "./bookings/bookings.module";
import { DatabaseModule } from "./database/database.module";

@Module({
  imports: [DatabaseModule, AuthModule, BookingsModule],
})
export class AppModule {}
