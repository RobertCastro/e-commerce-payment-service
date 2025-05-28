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
  paymentMethod: WompiPaymentMethod;
  reference: string;
  customerData: {
    phoneNumber: string;
    fullName: string;
  };
  shippingAddress: WompiShippingAddress;
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

export interface WompiShippingAddress {
  addressLine1: string;
  address_line_2?: string;
  country: string;
  region: string;
  city: string;
  name: string;
  phone_number: string;
  postal_code?: string;
}

export interface WompiPaymentMethod {
  type: 'CARD' | 'NEQUI' | 'PSE';
  token?: string;
  installments?: number;
  phone_number?: string;
}

export const IPaymentGateway = Symbol('IPaymentGateway');
