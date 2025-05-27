import { Inject, Injectable, Logger } from '@nestjs/common';
import { ITransactionRepository } from '../../domain/ports/transaction.repository.port';
import { IPaymentGateway } from '../../domain/ports/payment.gateway.port';
import { Result, success, failure } from '../../../../core/shared/result';
import { Transaction } from '../../domain/transaction.entity';
import { CheckoutError } from './initiate-checkout.use-case';
import { ProcessPaymentDto } from '../dto/process-payment.dto';
import { ICustomerRepository } from '../../domain/ports/customer.repository.port';
import { IDeliveryRepository } from '../../domain/ports/delivery.repository.port';
import { CreatePaymentInput } from '../../domain/ports/payment.gateway.port';

@Injectable()
export class ProcessPaymentUseCase {
  private readonly logger = new Logger(ProcessPaymentUseCase.name);

  constructor(
    @Inject(ITransactionRepository) private readonly transactionRepo: ITransactionRepository,
    @Inject(IPaymentGateway) private readonly paymentGateway: IPaymentGateway,
    @Inject(ICustomerRepository) private readonly customerRepo: ICustomerRepository,
    @Inject(IDeliveryRepository) private readonly deliveryRepo: IDeliveryRepository,
  ) {}

  async execute(
    transactionId: string,
    dto: ProcessPaymentDto,
  ): Promise<Result<Transaction, CheckoutError>> {
    this.logger.log(`Processing payment for transaction: ${transactionId}`);

    try {
      // 1. Buscar la transacción interna
      const transaction = await this.transactionRepo.findById(transactionId);
      if (!transaction) {
        return failure(
          new CheckoutError('TRANSACTION_NOT_FOUND', `Transaction ${transactionId} no encontrada.`),
        );
      }
      if (transaction.status !== 'PENDING') {
        return failure(
          new CheckoutError('INVALID_STATUS', `Transaction ${transactionId} no está PENDING.`),
        );
      }

      // 2. Buscar customer y delivery para obtener sus datos
      const customer = await this.customerRepo.findById(transaction.customerId);
      const delivery = await this.deliveryRepo.findById(transaction.deliveryId);

      if (!customer || !delivery) {
        return failure(new CheckoutError('DATA_NOT_FOUND', 'Faltan datos de Customer o Delivery.'));
      }

      // 3. Preparar el input para el gateway de pago
      const paymentInput: CreatePaymentInput = {
        amountInCents: transaction.totalAmount,
        currency: 'COP',
        customerEmail: customer.email,
        paymentMethod: dto.paymentMethod,
        reference: transaction.id,
        customerData: {
          phoneNumber: customer.phoneNumber,
          fullName: customer.fullName,
        },
        shippingAddress: {
          addressLine1: delivery.address,
          city: delivery.city,
          country: delivery.country,
          phone_number: customer.phoneNumber,
          region: delivery.city,
          name: customer.fullName,
        },
      };

      // 4. Llamar al gateway de pago
      const paymentResult = await this.paymentGateway.createPayment(paymentInput);

      if (!paymentResult.ok) {
        transaction.status = 'ERROR';
        await this.transactionRepo.update(transaction);
        return failure(new CheckoutError('GATEWAY_ERROR', paymentResult.error.message));
      }

      // 5. Wompi ok, actualizamos transacción
      const wompiData = paymentResult.value;
      transaction.wompiTransactionId = wompiData.gatewayTransactionId;
      transaction.status = wompiData.status as Transaction['status'];
      transaction.updatedAt = new Date();

      await this.transactionRepo.update(transaction);

      this.logger.log(
        `La transacción ${transaction.id} ha sido procesada, Wompi ID: ${wompiData.gatewayTransactionId}, Status: ${wompiData.status}`,
      );

      // 6. Devolvemos la transacción actualizada
      return success(transaction);
    } catch (error) {
      this.logger.error(`Error procesando el pago: ${error.message}`, error.stack);
      return failure(
        new CheckoutError('INTERNAL_ERROR', `Ocurrió un error inesperado: ${error.message}`),
      );
    }
  }
}
