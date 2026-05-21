import { Router, Request, Response, NextFunction } from "express";
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
} from "../dto/auth.dto";
import { DomainError, ConflictError, UnauthorizedError, NotFoundError } from "../../../shared/domain/errors/domain.error";

interface AuthRouteDependencies {
  signupUseCase: SignupUseCase;
  loginUseCase: LoginUseCase;
  getUserHandler: GetUserQueryHandler;
  jwtGuard: JwtGuard;
  adminGuard: AdminGuard;
}

export function createAuthRoutes(deps: AuthRouteDependencies): Router {
  const router = Router();

  // POST /auth/signup
  router.post("/signup", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, nickname, password } = req.body as SignupRequestDto;

      if (!email || !nickname || !password) {
        return res.status(400).json({
          error: "Missing required fields: email, nickname, password",
        });
      }

      const result = await deps.signupUseCase.execute({
        email,
        nickname,
        password,
      });

      const response: SignupResponseDto = {
        userId: result.userId,
        tokens: {
          accessToken: result.tokens.accessToken,
          refreshToken: result.tokens.refreshToken,
        },
      };

      res.status(201).json(response);
    } catch (error) {
      if (error instanceof ConflictError) {
        return res.status(409).json({ error: error.message });
      }
      if (error instanceof DomainError) {
        return res.status(400).json({ error: error.message });
      }
      next(error);
    }
  });

  // POST /auth/login
  router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body as LoginRequestDto;

      if (!email || !password) {
        return res.status(400).json({
          error: "Missing required fields: email, password",
        });
      }

      const result = await this.loginUseCase.execute({ email, password });

      const response: LoginResponseDto = {
        userId: result.userId,
        tokens: {
          accessToken: result.tokens.accessToken,
          refreshToken: result.tokens.refreshToken,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return res.status(401).json({ error: error.message });
      }
      if (error instanceof DomainError) {
        return res.status(400).json({ error: error.message });
      }
      next(error);
    }
  });

  // GET /auth/me (protected)
  router.get(
    "/me",
    (req: Request, res: Response, next: NextFunction) => deps.jwtGuard.canActivate(req, res, next),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const user = (req as any).user;

        if (!user) {
          return res.status(401).json({ error: "Unauthorized" });
        }

        const result = await deps.getUserHandler.execute({ id: user.id });

        const response: GetUserResponseDto = {
          id: result.id,
          email: result.email,
          nickname: result.nickname,
          role: result.role,
          createdAt: result.createdAt,
        };

        res.status(200).json(response);
      } catch (error) {
        if (error instanceof NotFoundError) {
          return res.status(404).json({ error: error.message });
        }
        next(error);
      }
    },
  );

  // GET /auth/admin-only (protected + admin)
  router.get(
    "/admin-only",
    (req: Request, res: Response, next: NextFunction) => deps.jwtGuard.canActivate(req, res, next),
    (req: Request, res: Response, next: NextFunction) => deps.adminGuard.canActivate(req, res, next),
    (req: Request, res: Response) => {
      const user = (req as any).user;
      res.status(200).json({ message: `Hello admin ${user.email}` });
    },
  );

  return router;
}