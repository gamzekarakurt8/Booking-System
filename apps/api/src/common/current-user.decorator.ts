import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export type AuthenticatedUser = {
  id: string;
  email: string;
  fullName: string;
};

export const CurrentUser = createParamDecorator((_: never, ctx: ExecutionContext): AuthenticatedUser => {
  const request = ctx.switchToHttp().getRequest();
  return request.user as AuthenticatedUser;
});
