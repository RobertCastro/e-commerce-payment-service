import { Test, TestingModule } from '@nestjs/testing';
import { HandleWompiEventUseCase } from './handle-wompi-event.use-case';
import { ITransactionRepository } from '../../../checkout/domain/ports/transaction.repository.port';
import { IProductRepository } from '../../../products/domain/ports/product.repository.port';
import { Transaction } from '../../../checkout/domain/transaction.entity';
import { Product } from '../../../products/domain/product.entity';
import { WompiEventDto } from '../dto/wompi-event.dto';

const mockTransactionRepo = {
  findById: jest.fn(),
  update: jest.fn(),
};

const mockProductRepo = {
  findById: jest.fn(),
  update: jest.fn(),
};

describe('HandleWompiEventUseCase', () => {
  let useCase: HandleWompiEventUseCase;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HandleWompiEventUseCase,
        { provide: ITransactionRepository, useValue: mockTransactionRepo },
        { provide: IProductRepository, useValue: mockProductRepo },
      ],
    }).compile();

    useCase = module.get<HandleWompiEventUseCase>(HandleWompiEventUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  // --- Evento APPROVED ---
  it('should update transaction to APPROVED and decrease stock', async () => {
    const transactionId = 'tx-approve-123';
    const wompiTxId = 'wompi-abc-approve';
    const mockEvent: WompiEventDto = {
      event: 'transaction.updated',
      data: {
        transaction: {
          id: wompiTxId,
          status: 'APPROVED',
          reference: transactionId,
        },
      },
    };

    const mockTransaction = new Transaction();
    mockTransaction.id = transactionId;
    mockTransaction.status = 'PENDING';
    mockTransaction.items = [{ productId: 'prod-1', quantity: 2, unitPrice: 1000 }];

    const mockProduct = new Product();
    mockProduct.id = 'prod-1';
    mockProduct.stock = 5;

    mockTransactionRepo.findById.mockResolvedValue(mockTransaction);
    mockProductRepo.findById.mockResolvedValue(mockProduct);
    mockTransactionRepo.update.mockResolvedValue(undefined);
    mockProductRepo.update.mockResolvedValue(undefined);

    const result = await useCase.execute(mockEvent);

    expect(result.ok).toBe(true);
    expect(mockTransactionRepo.findById).toHaveBeenCalledWith(transactionId);
    expect(mockTransaction.status).toBe('APPROVED');
    expect(mockTransaction.wompiTransactionId).toBe(wompiTxId);
    expect(mockTransactionRepo.update).toHaveBeenCalledWith(mockTransaction);
    expect(mockProductRepo.findById).toHaveBeenCalledWith('prod-1');
    expect(mockProduct.stock).toBe(3);
    expect(mockProductRepo.update).toHaveBeenCalledWith(mockProduct);
  });

  // --- Evento DECLINED ---
  it('should update transaction to DECLINED and NOT decrease stock', async () => {
    const transactionId = 'tx-decline-456';
    const wompiTxId = 'wompi-xyz-decline';
    const mockEvent: WompiEventDto = {
      event: 'transaction.updated',
      data: {
        transaction: {
          id: wompiTxId,
          status: 'DECLINED',
          reference: transactionId,
        },
      },
    };

    const mockTransaction = new Transaction();
    mockTransaction.id = transactionId;
    mockTransaction.status = 'PENDING';
    mockTransaction.items = [{ productId: 'prod-2', quantity: 1, unitPrice: 500 }];

    mockTransactionRepo.findById.mockResolvedValue(mockTransaction);
    mockTransactionRepo.update.mockResolvedValue(undefined);

    const result = await useCase.execute(mockEvent);

    expect(result.ok).toBe(true);
    expect(mockTransactionRepo.findById).toHaveBeenCalledWith(transactionId);
    expect(mockTransaction.status).toBe('DECLINED');
    expect(mockTransaction.wompiTransactionId).toBe(wompiTxId);
    expect(mockTransactionRepo.update).toHaveBeenCalledWith(mockTransaction);
    expect(mockProductRepo.findById).not.toHaveBeenCalled();
    expect(mockProductRepo.update).not.toHaveBeenCalled();
  });

  // --- Transacción no encontrada ---
  it('should return success and do nothing if transaction not found', async () => {
    const transactionId = 'tx-not-found-event';
    const mockEvent: WompiEventDto = {
      event: 'transaction.updated',
      data: {
        transaction: {
          id: 'wompi-id',
          status: 'APPROVED',
          reference: transactionId,
        },
      },
    };
    mockTransactionRepo.findById.mockResolvedValue(null);

    const result = await useCase.execute(mockEvent);

    expect(result.ok).toBe(true);
    expect(mockTransactionRepo.findById).toHaveBeenCalledWith(transactionId);
    expect(mockTransactionRepo.update).not.toHaveBeenCalled();
    expect(mockProductRepo.update).not.toHaveBeenCalled();
  });

  // --- Transacción ya en estado final ---
  it('should return success and do nothing if transaction already in final state', async () => {
    const transactionId = 'tx-final-state';
    const mockEvent: WompiEventDto = {
      event: 'transaction.updated',
      data: {
        transaction: { id: 'wompi-id', status: 'APPROVED', reference: transactionId },
      },
    };
    const mockTransaction = new Transaction();
    mockTransaction.id = transactionId;
    mockTransaction.status = 'APPROVED';

    mockTransactionRepo.findById.mockResolvedValue(mockTransaction);

    const result = await useCase.execute(mockEvent);

    expect(result.ok).toBe(true);
    expect(mockTransactionRepo.update).not.toHaveBeenCalled();
  });
});
