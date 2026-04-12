import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AiService } from './ai.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule.register([
      {
        name: 'AUTH_MICROSERVICE',
        transport: Transport.TCP,
        options: {
          host: 'auth-service', 
          port: 4000,
        },
      },
    ]),
    JwtModule.register({
      secret: 'nest-microservice-super-secret',
    }),
  ],
  controllers: [AppController],
  providers: [AppService, AiService],
})
export class AppModule {}
