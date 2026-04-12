import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AiService } from './ai.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
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
export class AppModule { }
