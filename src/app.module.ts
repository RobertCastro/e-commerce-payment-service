import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ProductsModule } from './modules/products/products.module';
import { CheckoutModule } from './modules/checkout/checkout.module';

import { WebhooksModule } from './modules/webhooks/webhooks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        PORT: Joi.number().default(3000),
        WOMPI_PUBLIC_KEY: Joi.string().required(),
        WOMPI_PRIVATE_KEY: Joi.string().required(),
        WOMPI_EVENTS_KEY: Joi.string().required(),
        WOMPI_INTEGRITY_KEY: Joi.string().required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
      }),
    }),
    // <-- Configuración de TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule, WebhooksModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [__dirname + '/modules/**/*.entity{.ts,.js}'],
        synchronize: true, // Lo agrego solo mientras se desarrolla
        logging: true, // Mientras se desarrolla
      }),
    }),
    ProductsModule,
    CheckoutModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
