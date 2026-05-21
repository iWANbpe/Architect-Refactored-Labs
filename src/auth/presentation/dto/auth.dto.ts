export class SignupRequestDto {
  email!: string;
  nickname!: string;
  password!: string;
}

export class LoginRequestDto {
  email!: string;
  password!: string;
}

export class GetUserResponseDto {
  id!: string;
  email!: string;
  nickname!: string;
  role!: string;
  createdAt!: Date;
}

export class AuthTokensResponseDto {
  accessToken!: string;
  refreshToken!: string;
}

export class SignupResponseDto {
  userId!: string;
  tokens!: AuthTokensResponseDto;
}

export class LoginResponseDto {
  userId!: string;
  tokens!: AuthTokensResponseDto;
}