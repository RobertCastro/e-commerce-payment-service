import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { IProductRepository } from './../src/modules/products/domain/ports/product.repository.port';
import { Product } from './../src/modules/products/domain/product.entity';

describe('ProductsController (e2e)', () => {
  let app: INestApplication;

  const mockProductRepository = {
    findAll: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(IProductRepository)
      .useValue(mockProductRepository)
      .compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    mockProductRepository.findAll.mockClear();
  });

  describe('/products (GET)', () => {
    it('should return an array of products when repository returns data', () => {
      const mockProducts = [
        new Product('uuid-1', 'Test Product', 'Desc', 99.99, 10, 'http://image.url/1'),
      ];
      mockProductRepository.findAll.mockResolvedValue(mockProducts);

      return request(app.getHttpServer())
        .get('/products')
        .expect(200)
        .expect((res) => {
          expect(res.body).toBeInstanceOf(Array);
          expect(res.body.length).toBe(1);
          expect(res.body[0].id).toEqual('uuid-1');
          expect(res.body[0].name).toEqual('Test Product');
        });
    });

    it('should return an empty array when repository returns empty', () => {
      mockProductRepository.findAll.mockResolvedValue([]);

      return request(app.getHttpServer())
        .get('/products')
        .expect(200)
        .expect((res) => {
          expect(res.body).toBeInstanceOf(Array);
          expect(res.body.length).toBe(0);
        });
    });

    it('should return 500 when repository throws an error', () => {
      const errorMessage = 'Database connection lost';
      mockProductRepository.findAll.mockRejectedValue(new Error(errorMessage));

      return request(app.getHttpServer())
        .get('/products')
        .expect(500)
        .expect((res) => {
          expect(res.body.message).toContain(errorMessage);
        });
    });
  });
});
