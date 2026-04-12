import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0', // 0.0.0.0 binds to all local network interfaces so the Gateway can reach it
        port: 4000,
      },
    },
  );
  await app.listen();
  console.log('Auth Microservice listening on TCP port 4000 🚀');
}
bootstrap();
