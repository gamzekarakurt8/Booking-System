import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthCredentialsInput, RegisterInput } from "@booking/shared";
import * as bcrypt from "bcrypt";
import { AuthRepository } from "./auth.repository";

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(input: RegisterInput) {
    const existingUser = await this.authRepository.findByEmail(input.email);
    if (existingUser) {
      throw new ConflictException("Email is already registered");
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const user = await this.authRepository.createUser({
      email: input.email,
      fullName: input.fullName,
      passwordHash,
    });

    return this.buildAuthResponse(user);
  }

  async login(input: AuthCredentialsInput) {
    const user = await this.authRepository.findByEmail(input.email);

    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid email or password");
    }

    return this.buildAuthResponse(user);
  }

  async me(userId: string) {
    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
    };
  }

  private buildAuthResponse(user: { id: string; email: string; fullName: string }) {
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      fullName: user.fullName,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
    };
  }
}
