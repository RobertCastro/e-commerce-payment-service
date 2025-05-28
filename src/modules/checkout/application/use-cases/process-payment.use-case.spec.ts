import { Test, TestingModule } from '@nestjs/testing';
import { ProcessPaymentUseCase } from './process-payment.use-case';
import { ITransactionRepository } from '../../domain/ports/transaction.repository.port';
import { IPaymentGateway } from '../../domain/ports/payment.gateway.port';
import { ICustomerRepository } from '../../domain/ports/customer.repository.port';
import { IDeliveryRepository } from '../../domain/ports/delivery.repository.port';
import { Transaction } from '../../domain/transaction.entity';
import { Customer } from '../../domain/customer.entity';
import { Delivery } from '../../domain/delivery.entity';
import { success, failure } from '../../../../core/shared/result';
import { PaymentGatewayError } from '../../domain/ports/payment.gateway.port';
import { ProcessPaymentDto } from '../dto/process-payment.dto';

const mockTransactionRepo = {
  findById: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  findByWompiId: jest.fn(),
};

const mockPaymentGateway = {
  createPayment: jest.fn(),
  getPaymentStatus: jest.fn(),
};

const mockCustomerRepo = {
  findById: jest.fn(),
  save: jest.fn(),
  findByEmail: jest.fn(),
};

const mockDeliveryRepo = {
  findById: jest.fn(),
  save: jest.fn(),
};

describe('ProcessPaymentUseCase', () => {
  let useCase: ProcessPaymentUseCase;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessPaymentUseCase,
        { provide: ITransactionRepository, useValue: mockTransactionRepo },
        { provide: IPaymentGateway, useValue: mockPaymentGateway },
        { provide: ICustomerRepository, useValue: mockCustomerRepo },
        { provide: IDeliveryRepository, useValue: mockDeliveryRepo },
      ],
    }).compile();

    useCase = module.get<ProcessPaymentUseCase>(ProcessPaymentUseCase);
  });

  it('debería estar definido', () => {
    expect(useCase).toBeDefined();
  });

  // --- Prueba pago exitoso ---
  it('debería procesar el pago con éxito y actualizar la transacción', async () => {
    const transactionId = 'tx-123';
    const wompiTxId = 'wompi-abc';
    const dto: ProcessPaymentDto = { paymentMethod: { type: 'CARD', token: 'tok_test' } };

    const mockCustomer = {
      id: 'cust-1',
      email: 'test@test.com',
      fullName: 'Test',
      phoneNumber: '123',
    } as Customer;
    const mockDelivery = { id: 'del-1', address: 'Addr', city: 'City', country: 'CO' } as Delivery;
    const mockTransaction = {
      id: transactionId,
      status: 'PENDING',
      totalAmount: 50000,
      customerId: 'cust-1',
      deliveryId: 'del-1',
      update: jest.fn(),
    } as unknown as Transaction;

    mockTransactionRepo.findById.mockResolvedValue(mockTransaction);
    mockCustomerRepo.findById.mockResolvedValue(mockCustomer);
    mockDeliveryRepo.findById.mockResolvedValue(mockDelivery);
    mockPaymentGateway.createPayment.mockResolvedValue(
      success({ gatewayTransactionId: wompiTxId, status: 'APPROVED' }),
    );
    mockTransactionRepo.update.mockResolvedValue(undefined);

    const result = await useCase.execute(transactionId, dto);

    // Verificamos
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.status).toBe('APPROVED');
      expect(result.value.wompiTransactionId).toBe(wompiTxId);
    }
    expect(mockTransactionRepo.findById).toHaveBeenCalledWith(transactionId);
    expect(mockPaymentGateway.createPayment).toHaveBeenCalled();
    expect(mockTransactionRepo.update).toHaveBeenCalled();
  });

  // --- Transacción no encontrada ---
  it('debería retornar fallo si no se encuentra la transacción', async () => {
    const transactionId = 'tx-not-found';
    const dto: ProcessPaymentDto = { paymentMethod: { type: 'CARD', token: 'tok_test' } };

    mockTransactionRepo.findById.mockResolvedValue(null);

    const result = await useCase.execute(transactionId, dto);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('TRANSACTION_NOT_FOUND');
    }
    expect(mockPaymentGateway.createPayment).not.toHaveBeenCalled();
  });

  // --- Wompi devuelve error ---
  it('debería retornar fallo si el gateway de pago devuelve un error', async () => {
    const transactionId = 'tx-123';
    const dto: ProcessPaymentDto = { paymentMethod: { type: 'CARD', token: 'tok_test' } };
    const mockCustomer = {
      id: 'cust-1',
      email: 'test@test.com',
      fullName: 'Test',
      phoneNumber: '123',
    } as Customer;
    const mockDelivery = { id: 'del-1', address: 'Addr', city: 'City', country: 'CO' } as Delivery;
    const mockTransaction = {
      id: transactionId,
      status: 'PENDING',
      totalAmount: 50000,
      customerId: 'cust-1',
      deliveryId: 'del-1',
    } as unknown as Transaction;

    mockTransactionRepo.findById.mockResolvedValue(mockTransaction);
    mockCustomerRepo.findById.mockResolvedValue(mockCustomer);
    mockDeliveryRepo.findById.mockResolvedValue(mockDelivery);
    mockPaymentGateway.createPayment.mockResolvedValue(
      failure(new PaymentGatewayError('Fondos insuficientes')),
    );

    const result = await useCase.execute(transactionId, dto);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('GATEWAY_ERROR');
    }
    expect(mockTransactionRepo.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'ERROR' }),
    );
  });
});
