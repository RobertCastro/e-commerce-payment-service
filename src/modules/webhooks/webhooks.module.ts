import { Module } from '@nestjs/common';
import { WebhooksController } from './infrastructure/controllers/webhooks.controller';
import { CheckoutModule } from '../checkout/checkout.module';
import { ProductsModule } from '../products/products.module';
import { HandleWompiEventUseCase } from './application/use-cases/handle-wompi-event.use-case';

@Module({
  imports: [CheckoutModule, ProductsModule],
  controllers: [WebhooksController],
  providers: [HandleWompiEventUseCase],
})
export class WebhooksModule {}
