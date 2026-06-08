import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalHttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  // Consistent error shape for every unhandled exception
  app.useGlobalFilters(new GlobalHttpExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
  console.log(`API Gateway listening on port ${process.env.PORT ?? 3000} 🚀`);
}
bootstrap().catch((err) => {
  console.error('Failed to bootstrap api-gateway:', err);
});
