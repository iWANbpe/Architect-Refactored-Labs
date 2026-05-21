import { Injectable } from "@nestjs/common";
import { Inject } from "@nestjs/common";
import { randomUUID } from "crypto";
import { RefreshToken } from "../../domain/entities/refresh-token.entity";
import { Email } from "../../domain/value-objects/email.vo";
import { UnauthorizedError } from "../../../shared/domain/errors/domain.error";
import { UserRepository, USER_REPOSITORY } from "../../domain/repositories/user.repository";
import { RefreshTokenRepository, REFRESH_TOKEN_REPOSITORY } from "../../domain/repositories/refresh-token.repository";
import { PasswordService, PASSWORD_SERVICE } from "../ports/password.service";
import { TokenService, TokenPair, TOKEN_SERVICE } from "../ports/token.service";

export interface LoginCommand {
  email: string;
  password: string;
}

export interface LoginResult {
  tokens: TokenPair;
  userId: string;
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepository,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepo: RefreshTokenRepository,
    @Inject(PASSWORD_SERVICE)
    private readonly passwordService: PasswordService,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenService,
  ) {}

  async execute(command: LoginCommand): Promise<LoginResult> {
    const email = Email.create(command.email);

    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const passwordValid = await this.passwordService.verify(command.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const tokens = this.tokenService.generateTokenPair(user.id, user.email.value, user.role);

    const tokenHash = this.tokenService.hashToken(tokens.refreshToken);
    const refreshToken = RefreshToken.create({
      id: randomUUID(),
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    });

    await this.refreshTokenRepo.save(refreshToken);

    return { tokens, userId: user.id };
  }
}