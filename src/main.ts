import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const logger = new Logger('Bootstrap');

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // --- Configuración swagger ---
  const config = new DocumentBuilder()
    .setTitle('E-commerce Payment API')
    .setDescription('API para el sistema de pagos con Wompi del e-commerce.')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Products', 'Operaciones relacionadas con productos')
    .addTag('Checkout', 'Operaciones del proceso de pago')
    .addTag('Webhooks', 'Recepción de notificaciones de Wompi')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      showRequestDuration: true,
    },
    customSiteTitle: 'E-commerce Payment API Docs',
  });
  // --- Fin configuración swagger ---

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 3000;
  await app.listen(port);

  logger.log(`🚀 Aplicación corriendo en: ${await app.getUrl()}`);
  logger.log(`📚 Documentación API disponible en: ${await app.getUrl()}/api-docs`);
}
bootstrap();
