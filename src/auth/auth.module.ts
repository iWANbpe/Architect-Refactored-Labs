import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { SignupUseCase } from "./application/commands/signup.use-case";
import { LoginUseCase } from "./application/commands/login.use-case";
import { GetUserQueryHandler } from "./application/queries/get-user.query";
import { UserRepository } from "./infrastructure/repositories/user.repository";
import { RefreshTokenRepository } from "./infrastructure/repositories/refresh-token.repository";
import { JwtTokenService } from "./infrastructure/services/jwt-token.service";
import { Argon2PasswordService } from "./infrastructure/services/argon-password.service";
import { AuthController } from "./presentation/controllers/auth.controller";
import { JwtGuard } from "./presentation/guards/jwt.guard";
import { AdminGuard } from "./presentation/guards/admin.guard";
import { UserOrmEntity } from "./infrastructure/entities/user.orm-entity";
import { RefreshTokenOrmEntity } from "./infrastructure/entities/refresh-token.orm-entity";
import { USER_REPOSITORY } from "./domain/repositories/user.repository";
import { PASSWORD_SERVICE } from "./application/ports/password.service";
import { TOKEN_SERVICE } from "./application/ports/token.service";
import { REFRESH_TOKEN_REPOSITORY } from "./domain/repositories/refresh-token.repository";
@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity, RefreshTokenOrmEntity]), ConfigModule],
  controllers: [AuthController],
  providers: [
    SignupUseCase,
    LoginUseCase,
    GetUserQueryHandler,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
    {
      provide: REFRESH_TOKEN_REPOSITORY,
      useClass: RefreshTokenRepository,
    },
    {
      provide: PASSWORD_SERVICE,
      useClass: Argon2PasswordService,
    },
    {
      provide: TOKEN_SERVICE,
      useFactory: (configService: ConfigService) =>
        new JwtTokenService({
          accessSecret: configService.get<string>("JWT_ACCESS_SECRET") || "access-secret-key",
          refreshSecret: configService.get<string>("JWT_REFRESH_SECRET") || "refresh-secret-key",
          accessExpiresIn: configService.get<string>("JWT_ACCESS_EXPIRES_IN") || "15m",
          refreshExpiresIn: configService.get<string>("JWT_REFRESH_EXPIRES_IN") || "7d",
        }),
      inject: [ConfigService],
    },
    JwtGuard,
    AdminGuard,
  ],
  exports: [JwtGuard, AdminGuard, TOKEN_SERVICE, PASSWORD_SERVICE],
})
export class AuthModule {}