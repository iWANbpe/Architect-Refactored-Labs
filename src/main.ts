import { dbConnection } from "./config/database"; 
import express, { Express, Request, Response, NextFunction } from "express";
import { createAuthRoutes } from "./auth/presentation/routes/auth.routes";
import { SignupUseCase } from "./auth/application/commands/signup.use-case";
import { LoginUseCase } from "./auth/application/commands/login.use-case";
import { GetUserQueryHandler } from "./auth/application/queries/get-user.query";
import { JwtGuard } from "./auth/presentation/guards/jwt.guard";
import { AdminGuard } from "./auth/presentation/guards/admin.guard";
import { UserRepository } from "./auth/infrastructure/repositories/user.repository";
import { RefreshTokenRepository } from "./auth/infrastructure/repositories/refresh-token.repository";
import { JwtTokenService } from "./auth/infrastructure/services/jwt-token.service";
import { Argon2PasswordService } from "./auth/infrastructure/services/argon-password.service";

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const userRepository = new UserRepository(dbConnection.getRepository("User"));
const refreshTokenRepository = new RefreshTokenRepository(dbConnection.getRepository("RefreshToken"));
const passwordService = new Argon2PasswordService();
const tokenService = new JwtTokenService({
  accessSecret: process.env.JWT_ACCESS_SECRET || "access-secret-key",
  refreshSecret: process.env.JWT_REFRESH_SECRET || "refresh-secret-key",
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
});

const signupUseCase = new SignupUseCase(userRepository, refreshTokenRepository, passwordService, tokenService);
const loginUseCase = new LoginUseCase(userRepository, refreshTokenRepository, passwordService, tokenService);
const getUserHandler = new GetUserQueryHandler(userRepository);

const jwtGuard = new JwtGuard(tokenService);
const adminGuard = new AdminGuard();

const authRoutes = createAuthRoutes({
  signupUseCase,
  loginUseCase,
  getUserHandler,
  jwtGuard,
  adminGuard,
});

app.use("/auth", authRoutes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

async function startServer() {
  try {
    await dbConnection.initialize();
    console.log("Database connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
}