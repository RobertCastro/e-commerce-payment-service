import { BaseError } from './base.error';

export class InsufficientStockError extends BaseError {
  readonly code = 'INSUFFICIENT_STOCK';

  constructor(productId: string, available: number, requested: number) {
    super(
      `Insufficient stock for product ${productId}. Available: ${available}, Requested: ${requested}`,
    );
  }
}
