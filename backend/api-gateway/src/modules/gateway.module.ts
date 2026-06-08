import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule } from '@nestjs/microservices';

import { JWT_SECRET } from '../common/constants/jwt.constants';
import { AUTH_SERVICE_TCP_OPTIONS } from '../common/constants/microservice.constants';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthClientService } from '../common/services/auth-client.service';
import { AuthController } from './auth/auth.controller';
import { HealthController } from './health/health.controller';
import { UsersController } from './users/users.controller';

@Module({
  imports: [
    ClientsModule.register([AUTH_SERVICE_TCP_OPTIONS]),
    JwtModule.register({ secret: JWT_SECRET }),
  ],
  controllers: [HealthController, AuthController, UsersController],
  providers: [AuthClientService, JwtAuthGuard],
})
export class GatewayModule {}
