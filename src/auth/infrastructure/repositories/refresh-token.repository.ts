import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull } from "typeorm";
import { RefreshToken } from "../../domain/entities/refresh-token.entity";
import { RefreshTokenRepository as IRefreshTokenRepository } from "../../domain/repositories/refresh-token.repository";
import { RefreshTokenOrmEntity } from "../entities/refresh-token.orm-entity";
import { RefreshTokenMapper } from "../mappers/refresh-token.mapper";

@Injectable()
export class RefreshTokenRepository implements IRefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshTokenOrmEntity)
    private readonly repo: Repository<RefreshTokenOrmEntity>,
  ) {}

  async save(token: RefreshToken): Promise<void> {
    const entity = RefreshTokenMapper.toEntity(token);
    await this.repo.save(entity);
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    const entity = await this.repo.findOne({ where: { tokenHash } });
    if (!entity) return null;
    return RefreshTokenMapper.toDomain(entity);
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.repo.update(
      { userId, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }

  async update(token: RefreshToken): Promise<void> {
    const entity = RefreshTokenMapper.toEntity(token);
    await this.repo.save(entity);
  }
}