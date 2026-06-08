import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule } from '@nestjs/microservices';
import { JWT_SECRET } from '../common/constants/jwt.constants';
import { AUTH_SERVICE_TCP_OPTIONS } from '../common/constants/microservice.constants';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AiService } from './ai.service';
import { AppService } from './app.service';
import { GatewayController } from './gateway.controller';

@Module({
  imports: [
    ClientsModule.register([AUTH_SERVICE_TCP_OPTIONS]),
    JwtModule.register({ secret: JWT_SECRET }),
  ],
  controllers: [GatewayController],
  providers: [AppService, AiService, JwtAuthGuard],
})
export class GatewayModule {}
