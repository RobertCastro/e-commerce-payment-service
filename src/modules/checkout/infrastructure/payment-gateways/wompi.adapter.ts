import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import * as crypto from 'crypto';
import {
  IPaymentGateway,
  CreatePaymentInput,
  CreatePaymentOutput,
  PaymentGatewayError,
  PaymentStatusOutput,
} from '../../domain/ports/payment.gateway.port';
import { Result, success, failure } from '../../../../core/shared/result';

@Injectable()
export class WompiPaymentGatewayAdapter implements IPaymentGateway, OnModuleInit {
  private readonly logger = new Logger(WompiPaymentGatewayAdapter.name);
  private readonly wompiApiUrl: string;
  private readonly privateKey: string;
  private readonly publicKey: string;
  private readonly integrityKey: string;
  private acceptanceToken: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.wompiApiUrl = this.configService.get<string>(
      'WOMPI_API_URL',
      'https://api-sandbox.co.uat.wompi.dev/v1',
    );
    this.privateKey = this.configService.get<string>('WOMPI_PRIVATE_KEY', '');
    this.publicKey = this.configService.get<string>('WOMPI_PUBLIC_KEY', '');
    this.integrityKey = this.configService.get<string>('WOMPI_INTEGRITY_KEY', '');

    if (!this.privateKey || !this.publicKey || !this.integrityKey || !this.wompiApiUrl) {
      throw new Error('¡URL o claves de Wompi no configuradas!');
    }
  }

  async onModuleInit() {
    await this.loadAcceptanceToken();
  }

  // Método para cargar el token de aceptación
  private async loadAcceptanceToken(): Promise<void> {
    this.logger.log('Cargando token de aceptación de Wompi...');
    const url = `${this.wompiApiUrl}/merchants/${this.publicKey}`;

    try {
      const response = await firstValueFrom(this.httpService.get(url));
      const token = response.data?.data?.presigned_acceptance?.acceptance_token;

      if (!token) {
        throw new Error('Token de aceptación no encontrado en la respuesta de Wompi.');
      }
      this.acceptanceToken = token;
      this.logger.log('Token de aceptación de Wompi cargado exitosamente.');
    } catch (error) {
      this.logger.error('Error al cargar el token de aceptación de Wompi.', error);
      throw new Error(`Error al cargar el token de aceptación de Wompi: ${error.message}`);
    }
  }

  // Método para calcular la firma
  private calculateSignature(reference: string, amountInCents: number, currency: string): string {
    const dataToSign = `${reference}${amountInCents}${currency}${this.integrityKey}`;
    return crypto.createHash('sha256').update(dataToSign).digest('hex');
  }

  async createPayment(
    input: CreatePaymentInput,
  ): Promise<Result<CreatePaymentOutput, PaymentGatewayError>> {
    if (!this.acceptanceToken) {
      this.logger.error('Token de aceptación no disponible. Intentando recargar...');
      await this.loadAcceptanceToken();
      if (!this.acceptanceToken) {
        return failure(new PaymentGatewayError('Token de aceptación de Wompi no disponible.'));
      }
    }

    const url = `${this.wompiApiUrl}/transactions`;
    const headers = { Authorization: `Bearer ${this.privateKey}` };
    const signature = this.calculateSignature(input.reference, input.amountInCents, input.currency);

    const wompiPayload = {
      acceptance_token: this.acceptanceToken,
      amount_in_cents: input.amountInCents,
      currency: input.currency,
      signature: signature,
      customer_email: input.customerEmail,
      payment_method: input.paymentMethod,
      reference: input.reference,
      redirect_url: 'https://mitienda.com/resultado',
      customer_data: input.customerData,
      shipping_address: input.shippingAddress,
    };

    this.logger.log(`Enviando solicitud de pago a Wompi para ref: ${input.reference}`);

    try {
      const response = await firstValueFrom(this.httpService.post(url, wompiPayload, { headers }));
      const data = response.data.data;

      if (data && data.id && data.status) {
        //
        this.logger.log(`Transacción de Wompi creada: ${data.id}, Estado: ${data.status}`);
        return success({
          gatewayTransactionId: data.id,
          status: data.status,
          redirectUrl: data.redirect_url,
        });
      } else {
        throw new Error('Estructura de respuesta inválida de Wompi');
      }
    } catch (error) {
      return this.handleWompiError(error, 'createPayment');
    }
  }

  async getPaymentStatus(
    gatewayTransactionId: string,
  ): Promise<Result<PaymentStatusOutput, PaymentGatewayError>> {
    const url = `${this.wompiApiUrl}/transactions/${gatewayTransactionId}`;
    const headers = { Authorization: `Bearer ${this.privateKey}` };
    this.logger.log(`Obteniendo estado de transacción de Wompi para: ${gatewayTransactionId}`);

    try {
      const response = await firstValueFrom(this.httpService.get(url, { headers }));
      const data = response.data.data;

      if (data && data.id && data.status) {
        //
        return success({
          gatewayTransactionId: data.id,
          reference: data.reference,
          status: data.status,
          amountInCents: data.amount_in_cents,
        });
      } else {
        throw new Error('Estructura de respuesta inválida de Wompi');
      }
    } catch (error) {
      return this.handleWompiError(error, 'getPaymentStatus');
    }
  }

  private handleWompiError(error: any, operation: string): Result<any, PaymentGatewayError> {
    if (error instanceof AxiosError && error.response) {
      this.logger.error(
        `Error de la API de Wompi durante ${operation}: ${error.response.status}`,
        error.response.data,
      );
      return failure(
        new PaymentGatewayError(
          `Error de la API de Wompi (${error.response.status})`,
          error.response.data?.error,
        ),
      );
    } else {
      this.logger.error(`Error genérico durante ${operation}: ${error.message}`, error);
      return failure(new PaymentGatewayError(`Error genérico: ${error.message}`));
    }
  }
}
