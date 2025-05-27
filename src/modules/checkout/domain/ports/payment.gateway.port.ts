import { Result } from '../../../../core/shared/result';
import { BaseError } from '../../../../core/errors/base.error';

export class PaymentGatewayError extends BaseError {
  readonly code = 'PAYMENT_GATEWAY_ERROR';
  constructor(
    message: string,
    readonly details?: any,
  ) {
    super(message);
  }
}

export interface CreatePaymentInput {
  amountInCents: number;
  currency: string;
  customerEmail: string;
  paymentMethod: {
    type: 'CARD';
    token?: string;
    installments?: number;
  };
  reference: string;
  customerData: {
    phoneNumber: string;
    fullName: string;
  };
  shippingAddress: {
    addressLine1: string;
    city: string;
    country: string;
  };
}

export interface CreatePaymentOutput {
  gatewayTransactionId: string;
  status: string;
  redirectUrl?: string;
}

export interface PaymentStatusOutput {
  gatewayTransactionId: string;
  reference: string;
  status: string;
  amountInCents: number;
}

export interface IPaymentGateway {
  createPayment(
    input: CreatePaymentInput,
  ): Promise<Result<CreatePaymentOutput, PaymentGatewayError>>;

  getPaymentStatus(
    gatewayTransactionId: string,
  ): Promise<Result<PaymentStatusOutput, PaymentGatewayError>>;
}

export const IPaymentGateway = Symbol('IPaymentGateway');
