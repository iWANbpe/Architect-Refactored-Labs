import { Request, Response, NextFunction } from "express";
import { Inject } from "@nestjs/common";
import { TokenService, TOKEN_SERVICE } from "../../application/ports/token.service";
import { UnauthorizedError } from "../../../shared/domain/errors/domain.error";
import { AuthenticatedRequest } from "../../../shared/presentation/authenticated-request.type";

export class JwtGuard {
  constructor(private readonly tokenService: TokenService) {}

  canActivate(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid Authorization header" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const payload = this.tokenService.verifyAccessToken(token);

      if (payload.type !== "access") {
        throw new UnauthorizedError("Invalid token type");
      }

      (req as AuthenticatedRequest).user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };

      next();
    } catch (error) {
      res.status(401).json({ error: "Invalid or expired access token" });
    }
  }
}