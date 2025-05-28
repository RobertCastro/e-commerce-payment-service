import { Test, TestingModule } from '@nestjs/testing';
import { GetTransactionStatusUseCase } from './get-transaction-status.use-case';
import { ITransactionRepository } from '../../domain/ports/transaction.repository.port';
import { Transaction } from '../../domain/transaction.entity';
import { TransactionDetailDto } from '../dto/transaction-detail.dto';
// import { Result, success, failure } from '../../../../core/shared/result';

const mockTransactionRepo = {
  findById: jest.fn(),
};

describe('GetTransactionStatusUseCase', () => {
  let useCase: GetTransactionStatusUseCase;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetTransactionStatusUseCase,
        { provide: ITransactionRepository, useValue: mockTransactionRepo },
      ],
    }).compile();

    useCase = module.get<GetTransactionStatusUseCase>(GetTransactionStatusUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  // --- Transacción encontrada ---
  it('debería retornar los detalles de la transacción cuando la transacción es encontrada', async () => {
    const transactionId = 'tx-found-123';
    const mockDbTransaction = new Transaction();
    mockDbTransaction.id = transactionId;
    mockDbTransaction.status = 'PENDING';
    mockDbTransaction.totalAmount = 150000;
    mockDbTransaction.items = [{ productId: 'prod-1', quantity: 1, unitPrice: 150000 }];
    mockDbTransaction.createdAt = new Date();
    mockDbTransaction.updatedAt = new Date();
    mockDbTransaction.customerId = 'cust-1';
    mockDbTransaction.deliveryId = 'del-1';
    mockDbTransaction.shippingCost = 0;
    mockDbTransaction.baseFee = 0;

    mockTransactionRepo.findById.mockResolvedValue(mockDbTransaction);

    const result = await useCase.execute(transactionId);

    expect(result.ok).toBe(true);
    expect(mockTransactionRepo.findById).toHaveBeenCalledWith(transactionId);
    if (result.ok) {
      expect(result.value).toBeInstanceOf(TransactionDetailDto);
      expect(result.value.id).toBe(transactionId);
      expect(result.value.status).toBe('PENDING');
      expect(result.value.totalAmount).toBe(150000);
    }
  });

  // --- Transacción no encontrada ---
  it('debería retornar error si la transacción no es encontrada', async () => {
    const transactionId = 'tx-not-found-404';
    mockTransactionRepo.findById.mockResolvedValue(null);

    const result = await useCase.execute(transactionId);

    expect(result.ok).toBe(false);
    expect(mockTransactionRepo.findById).toHaveBeenCalledWith(transactionId);
    if (!result.ok) {
      expect(result.error.code).toBe('TRANSACTION_NOT_FOUND');
    }
  });

  // --- Error interno del repositorio ---
  it('debería retornar error si el repositorio lanza una excepción', async () => {
    const transactionId = 'tx-repo-error-500';
    const errorMessage = 'Database connection error';
    mockTransactionRepo.findById.mockRejectedValue(new Error(errorMessage));

    const result = await useCase.execute(transactionId);

    expect(result.ok).toBe(false);
    expect(mockTransactionRepo.findById).toHaveBeenCalledWith(transactionId);
    if (!result.ok) {
      expect(result.error.code).toBe('INTERNAL_ERROR');
      expect(result.error.message).toContain(errorMessage);
    }
  });
});
