import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DatabaseService } from "../database/database.service";
import { users } from "../database/schema";

@Injectable()
export class AuthRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findByEmail(email: string) {
    const [user] = await this.databaseService.db.select().from(users).where(eq(users.email, email)).limit(1);
    return user ?? null;
  }

  async findById(id: string) {
    const [user] = await this.databaseService.db.select().from(users).where(eq(users.id, id)).limit(1);
    return user ?? null;
  }

  async createUser(input: { email: string; fullName: string; passwordHash: string }) {
    const [user] = await this.databaseService.db.insert(users).values(input).returning();
    if (!user) {
      throw new InternalServerErrorException("Failed to create user");
    }

    return user;
  }
}
