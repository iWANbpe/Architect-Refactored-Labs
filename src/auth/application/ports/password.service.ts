export interface PasswordService {
  hash(password: string): Promise<string>;
  verify(password: string, hash: string): Promise<boolean>;
}

export const PASSWORD_SERVICE = "PASSWORD_SERVICE";