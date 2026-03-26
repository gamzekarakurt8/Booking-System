import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { authCredentialsSchema, registerSchema } from "@booking/shared";
import { CurrentUser, type AuthenticatedUser } from "../common/current-user.decorator";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  register(@Body(new ZodValidationPipe(registerSchema)) body: ReturnType<typeof registerSchema.parse>) {
    return this.authService.register(body);
  }

  @Post("login")
  login(@Body(new ZodValidationPipe(authCredentialsSchema)) body: ReturnType<typeof authCredentialsSchema.parse>) {
    return this.authService.login(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.me(user.id);
  }
}
