import { Request, Response, NextFunction } from "express";
import { UserRole } from "../../../shared/domain/value-objects/user-role.enum";
import { AuthenticatedRequest } from "../../../shared/presentation/authenticated-request.type";

export class AdminGuard {
  canActivate(req: Request, res: Response, next: NextFunction): void {
    const user = (req as AuthenticatedRequest).user;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (user.role !== UserRole.ADMIN) {
      return res.status(403).json({ error: "Forbidden: admin access required" });
    }

    next();
  }
}