import { User } from "../../domain/entities/user.entity";
import { Email } from "../../domain/value-objects/email.vo";
import { parseUserRole } from "../../../shared/domain/value-objects/user-role.enum";
import { UserOrmEntity } from "../entities/user.orm-entity";

export class UserMapper {
  static toDomain(entity: UserOrmEntity): User {
    return User.fromPersistence({
      id: entity.id,
      email: Email.fromPersistence(entity.email),
      nickname: entity.nickname,
      passwordHash: entity.password,
      role: parseUserRole(entity.role),
      createdAt: entity.createdAt,
    });
  }

  static toEntity(user: User): UserOrmEntity {
    const entity = new UserOrmEntity();
    entity.id = user.id;
    entity.email = user.email.value;
    entity.nickname = user.nickname;
    entity.password = user.passwordHash;
    entity.role = user.role;
    entity.createdAt = user.createdAt;
    return entity;
  }
}