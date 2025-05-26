import { BaseError } from './base.error';

export class ValidationError extends BaseError {
  readonly code = 'VALIDATION_ERROR';

  constructor(
    message: string,
    readonly details?: Record<string, unknown>,
  ) {
    super(message);
  }
}
