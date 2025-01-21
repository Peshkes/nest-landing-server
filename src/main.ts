import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Logger, ValidationPipe } from "@nestjs/common";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { createAdminUser } from "./authentication/initialization/initialize-default-user";

const connect = async () => {
  await mongoose
    .connect("mongodb://localhost:27017/mongo-landings-db")
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: "http://localhost:5173",
    credentials: true,
  });

  app.use(cookieParser());

  app.useLogger(new Logger());

  await connect();
  await createAdminUser();

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(process.env.PORT ?? 29000);
}

bootstrap();
