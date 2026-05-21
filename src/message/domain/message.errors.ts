import { DomainError } from '../../shared/domain/errors/domain.error';

export class MessageNotFoundError extends DomainError {
  constructor() {
    super('Message not found');
  }
}
