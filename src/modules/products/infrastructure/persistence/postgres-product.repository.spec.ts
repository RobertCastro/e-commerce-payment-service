import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../domain/product.entity';
import { PostgresProductRepository } from './postgres-product.repository';
import { IProductRepository } from '../../domain/ports/product.repository.port';

type MockRepository<T extends object = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const createMockRepository = <T extends object = any>(): MockRepository<T> => ({
  findOneBy: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
});

describe('PostgresProductRepository', () => {
  let repository: IProductRepository;
  let mockTypeOrmRepo: MockRepository<Product>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostgresProductRepository,
        {
          provide: IProductRepository,
          useClass: PostgresProductRepository,
        },
        {
          provide: getRepositoryToken(Product),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    repository = module.get<IProductRepository>(IProductRepository);
    mockTypeOrmRepo = module.get<MockRepository>(getRepositoryToken(Product));
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findById', () => {
    it('should call TypeORM findOneBy with correct id', async () => {
      const productId = 'test-uuid';
      const product = new Product(productId, 'Test', 'Desc', 10, 5, 'url');
      mockTypeOrmRepo.findOneBy?.mockReturnValue(Promise.resolve(product));

      const result = await repository.findById(productId);

      expect(mockTypeOrmRepo.findOneBy).toHaveBeenCalledWith({ id: productId });
      expect(result).toEqual(product);
    });
  });

  describe('findAll', () => {
    it('should call TypeORM find', async () => {
      const products = [new Product('1', 'P1', 'D1', 10, 1, 'u1')];
      mockTypeOrmRepo.find?.mockReturnValue(Promise.resolve(products));

      const result = await repository.findAll();

      expect(mockTypeOrmRepo.find).toHaveBeenCalled();
      expect(result).toEqual(products);
    });
  });
});
