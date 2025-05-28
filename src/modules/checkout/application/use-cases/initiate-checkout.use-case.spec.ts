import { Test, TestingModule } from '@nestjs/testing';
import { InitiateCheckoutUseCase } from './initiate-checkout.use-case';
import { IProductRepository } from '../../../products/domain/ports/product.repository.port';
import { ITransactionRepository } from '../../domain/ports/transaction.repository.port';
import { ICustomerRepository } from '../../domain/ports/customer.repository.port';
import { IDeliveryRepository } from '../../domain/ports/delivery.repository.port';
import { Product } from '../../../products/domain/product.entity';
// import { Transaction } from '../../domain/transaction.entity';
// import { Customer } from '../../domain/customer.entity';
// import { Delivery } from '../../domain/delivery.entity';
import { InitiateCheckoutDto } from '../dto/initiate-checkout.dto';
// import { success, failure } from '../../../../core/shared/result';
import { v4 as uuidv4 } from 'uuid'; // Usaremos esto para IDs en el mock

const mockProductRepo = {
  findById: jest.fn(),
  update: jest.fn(),
};
const mockTransactionRepo = {
  save: jest.fn(),
  findById: jest.fn(),
};
const mockCustomerRepo = {
  save: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
};
const mockDeliveryRepo = {
  save: jest.fn(),
  findById: jest.fn(),
};

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

describe('InitiateCheckoutUseCase', () => {
  let useCase: InitiateCheckoutUseCase;
  let mockUuidCounter: number;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockUuidCounter = 1;
    (uuidv4 as jest.Mock).mockImplementation(() => `mock-uuid-${mockUuidCounter++}`);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InitiateCheckoutUseCase,
        { provide: IProductRepository, useValue: mockProductRepo },
        { provide: ITransactionRepository, useValue: mockTransactionRepo },
        { provide: ICustomerRepository, useValue: mockCustomerRepo },
        { provide: IDeliveryRepository, useValue: mockDeliveryRepo },
      ],
    }).compile();

    useCase = module.get<InitiateCheckoutUseCase>(InitiateCheckoutUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  // --- Iniciar checkout ---
  it('debería iniciar el checkout exitosamente cuando los productos existen y hay stock suficiente', async () => {
    const productId1 = 'prod-uuid-1';
    const dto: InitiateCheckoutDto = {
      items: [{ productId: productId1, quantity: 1 }],
      customer: { email: 'test@example.com', fullName: 'Test User', phoneNumber: '12345' },
      delivery: { address: '123 Main St', city: 'Testville', country: 'TC' },
    };

    const mockProduct1 = new Product();
    mockProduct1.id = productId1;
    mockProduct1.name = 'Test Product 1';
    mockProduct1.price = 100;
    mockProduct1.stock = 5;
    mockProduct1.imageUrl = 'url1';

    mockProductRepo.findById.mockResolvedValueOnce(mockProduct1);
    mockCustomerRepo.save.mockResolvedValue(undefined);
    mockDeliveryRepo.save.mockResolvedValue(undefined);
    mockTransactionRepo.save.mockResolvedValue(undefined);

    const result = await useCase.execute(dto);

    expect(result.ok).toBe(true);
    expect(mockProductRepo.findById).toHaveBeenCalledWith(productId1);
    expect(mockCustomerRepo.save).toHaveBeenCalled();
    expect(mockDeliveryRepo.save).toHaveBeenCalled();
    expect(mockTransactionRepo.save).toHaveBeenCalled();

    if (result.ok) {
      const createdTransaction = result.value;
      expect(createdTransaction.status).toBe('PENDING');
      expect(createdTransaction.items.length).toBe(1);
      expect(createdTransaction.items[0].productId).toBe(productId1);
      expect(createdTransaction.items[0].unitPrice).toBe(100 * 100);
      expect(createdTransaction.totalAmount).toBe(100 * 100 * 1 + 500000 + 100000);
      expect(createdTransaction.customerId).toBe('mock-uuid-1');
      expect(createdTransaction.deliveryId).toBe('mock-uuid-2');
      expect(createdTransaction.id).toBe('mock-uuid-3');
    }
  });

  // --- Producto no encontrado ---
  it('debería retornar un fallo si no se encuentra un producto', async () => {
    const productId1 = 'prod-uuid-non-existent';
    const dto: InitiateCheckoutDto = {
      items: [{ productId: productId1, quantity: 1 }],
      customer: { email: 'test@example.com', fullName: 'Test User', phoneNumber: '12345' },
      delivery: { address: '123 Main St', city: 'Testville', country: 'TC' },
    };
    mockProductRepo.findById.mockResolvedValue(null);

    const result = await useCase.execute(dto);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('PRODUCT_NOT_FOUND');
    }
    expect(mockCustomerRepo.save).not.toHaveBeenCalled();
    expect(mockTransactionRepo.save).not.toHaveBeenCalled();
  });

  // --- Stock insuficiente ---
  it('debería retornar un fallo si el stock es insuficiente', async () => {
    const productId1 = 'prod-uuid-low-stock';
    const dto: InitiateCheckoutDto = {
      items: [{ productId: productId1, quantity: 10 }],
      customer: { email: 'test@example.com', fullName: 'Test User', phoneNumber: '12345' },
      delivery: { address: '123 Main St', city: 'Testville', country: 'TC' },
    };
    const mockProduct1 = new Product();
    mockProduct1.id = productId1;
    mockProduct1.name = 'Producto de Prueba con Poco Stock';
    mockProduct1.price = 100;
    mockProduct1.stock = 5;
    mockProduct1.imageUrl = 'url_low';

    mockProductRepo.findById.mockResolvedValue(mockProduct1);

    const result = await useCase.execute(dto);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('INSUFFICIENT_STOCK');
    }
    expect(mockTransactionRepo.save).not.toHaveBeenCalled();
  });
});
