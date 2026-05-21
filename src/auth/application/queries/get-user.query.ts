import { Injectable } from "@nestjs/common";
import { Inject } from "@nestjs/common";
import { User } from "../../domain/entities/user.entity";
import { NotFoundError } from "../../../shared/domain/errors/domain.error";
import { UserRepository, USER_REPOSITORY } from "../../domain/repositories/user.repository";

export interface GetUserQuery {
  id: string;
}

export interface GetUserResult {
  id: string;
  email: string;
  nickname: string;
  role: string;
  createdAt: Date;
}

@Injectable()
export class GetUserQueryHandler {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepository,
  ) {}

  async execute(query: GetUserQuery): Promise<GetUserResult> {
    const user = await this.userRepo.findById(query.id);

    if (!user) {
      throw new NotFoundError(`User with id ${query.id} not found`);
    }

    return {
      id: user.id,
      email: user.email.value,
      nickname: user.nickname,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}