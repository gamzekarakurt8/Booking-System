import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: env.WEB_ORIGIN,
    credentials: true,
  });

  app.use(cookieParser());

  await app.listen(env.API_PORT);
}

bootstrap();
