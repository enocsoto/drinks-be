import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { ValidationPipe, Logger } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  const logger = new Logger("Bootstrap");
  const PORT = process.env.APP_PORT ?? 3000;
  const GLOBAL_PREFIX = "api";
  const SWAGGER_PATH = "docs";

  app.setGlobalPrefix(GLOBAL_PREFIX);

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Drinks API")
    .setDescription("API documentation")
    .setVersion("1.0")
    .addBearerAuth({ type: "http", scheme: "bearer", bearerFormat: "JWT" }, "Authorization")
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${GLOBAL_PREFIX}/${SWAGGER_PATH}`, app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  await app.listen(PORT);
  logger.log(`Application is running on: http://localhost:${PORT}/${GLOBAL_PREFIX}`);
  logger.log(
    `Swagger documentation available at: http://localhost:${PORT}/${GLOBAL_PREFIX}/${SWAGGER_PATH}`,
  );
}
bootstrap();
