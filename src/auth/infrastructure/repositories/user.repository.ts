import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../../domain/entities/user.entity";
import { Email } from "../../domain/value-objects/email.vo";
import { UserRepository as IUserRepository } from "../../domain/repositories/user.repository";
import { UserOrmEntity } from "../entities/user.orm-entity";
import { UserMapper } from "../mappers/user.mapper";

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repo: Repository<UserOrmEntity>,
  ) {}

  async save(user: User): Promise<void> {
    const entity = UserMapper.toEntity(user);
    await this.repo.save(entity);
  }

  async findById(id: string): Promise<User | null> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) return null;
    return UserMapper.toDomain(entity);
  }

  async findByEmail(email: Email): Promise<User | null> {
    const entity = await this.repo.findOne({ where: { email: email.value } });
    if (!entity) return null;
    return UserMapper.toDomain(entity);
  }

  async existsByEmail(email: Email): Promise<boolean> {
    const count = await this.repo.count({ where: { email: email.value } });
    return count > 0;
  }

  async existsByNickname(nickname: string): Promise<boolean> {
    const count = await this.repo.count({ where: { nickname } });
    return count > 0;
  }
}