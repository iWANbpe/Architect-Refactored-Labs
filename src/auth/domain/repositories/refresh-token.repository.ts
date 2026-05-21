import { RefreshToken } from "../entities/refresh-token.entity";

export interface RefreshTokenRepository {
  save(token: RefreshToken): Promise<void>;
  findByTokenHash(tokenHash: string): Promise<RefreshToken | null>;
  revokeAllForUser(userId: string): Promise<void>;
  update(token: RefreshToken): Promise<void>;
}

export const REFRESH_TOKEN_REPOSITORY = "REFRESH_TOKEN_REPOSITORY";