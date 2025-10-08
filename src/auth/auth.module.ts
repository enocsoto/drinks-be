import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { UserModule } from "../user/user.module";
import { Strategy } from "./enum/strategyes.enum";
import { JwtStrategy } from "./strategies/jwt.strategies";
import { SequelizeModule } from "@nestjs/sequelize";
import { User } from "../user/entities/user.entity";

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: Strategy.JWT }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET"),
        signOptions: {
          expiresIn: configService.getOrThrow<string>("EXPIRES_IN"),
        },
      }),
    }),
    SequelizeModule.forFeature([User]),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtModule, PassportModule, JwtStrategy, SequelizeModule],
})
export class AuthModule {}
