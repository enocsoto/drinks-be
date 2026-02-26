import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri:
          configService.get("MONGODB_URI") ??
          `mongodb://${configService.get("DB_HOST") ?? "localhost"}:${configService.get("DB_PORT") ?? 27017}/${configService.get("DB_NAME") ?? "drinks"}`,
      }),
    }),
  ],
})
export class DatabaseModule {}
