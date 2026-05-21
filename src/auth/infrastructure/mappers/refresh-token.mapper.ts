import { RefreshToken } from "../../domain/entities/refresh-token.entity";
import { RefreshTokenOrmEntity } from "../entities/refresh-token.orm-entity";

export class RefreshTokenMapper {
  static toDomain(entity: RefreshTokenOrmEntity): RefreshToken {
    return RefreshToken.fromPersistence({
      id: entity.id,
      userId: entity.userId,
      tokenHash: entity.tokenHash,
      expiresAt: entity.expiresAt,
      revokedAt: entity.revokedAt,
      createdAt: entity.createdAt,
    });
  }

  static toEntity(token: RefreshToken): RefreshTokenOrmEntity {
    const entity = new RefreshTokenOrmEntity();
    entity.id = token.id;
    entity.userId = token.userId;
    entity.tokenHash = token.tokenHash;
    entity.expiresAt = token.expiresAt;
    entity.revokedAt = token.revokedAt;
    entity.createdAt = token.createdAt;
    return entity;
  }
}