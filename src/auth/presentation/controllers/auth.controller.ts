import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Inject,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from "@nestjs/common";
import { SignupUseCase } from "../../application/commands/signup.use-case";
import { LoginUseCase } from "../../application/commands/login.use-case";
import { GetUserQueryHandler } from "../../application/queries/get-user.query";
import { JwtGuard } from "../guards/jwt.guard";
import { AdminGuard } from "../guards/admin.guard";
import {
  SignupRequestDto,
  LoginRequestDto,
  SignupResponseDto,
  LoginResponseDto,
  GetUserResponseDto,
  AuthTokensResponseDto,
} from "../dto/auth.dto";
import { CurrentUser } from "../decorators/current-user.decorator";
import { DomainError, ConflictError, UnauthorizedError, NotFoundError } from "../../../shared/domain/errors/domain.error";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly signupUseCase: SignupUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly getUserHandler: GetUserQueryHandler,
  ) {}

  @Post("signup")
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() dto: SignupRequestDto): Promise<SignupResponseDto> {
    try {
      const result = await this.signupUseCase.execute({
        email: dto.email,
        nickname: dto.nickname,
        password: dto.password,
      });

      return {
        userId: result.userId,
        tokens: {
          accessToken: result.tokens.accessToken,
          refreshToken: result.tokens.refreshToken,
        },
      };
    } catch (error) {
      if (error instanceof ConflictError) {
        throw new ConflictException(error.message);
      }
      if (error instanceof DomainError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginRequestDto): Promise<LoginResponseDto> {
    try {
      const result = await this.loginUseCase.execute({
        email: dto.email,
        password: dto.password,
      });

      return {
        userId: result.userId,
        tokens: {
          accessToken: result.tokens.accessToken,
          refreshToken: result.tokens.refreshToken,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw new UnauthorizedException(error.message);
      }
      if (error instanceof DomainError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Get("me")
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async getMe(@CurrentUser() user: any): Promise<GetUserResponseDto> {
    try {
      const result = await this.getUserHandler.execute({ id: user.id });

      return {
        id: result.id,
        email: result.email,
        nickname: result.nickname,
        role: result.role,
        createdAt: result.createdAt,
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @Get("admin-only")
  @UseGuards(JwtGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  async adminOnly(@CurrentUser() user: any): Promise<{ message: string }> {
    return { message: `Hello admin ${user.email}` };
  }
}