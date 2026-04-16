import { Transport } from '@nestjs/microservices';

export const AUTH_SERVICE_CLIENT = 'AUTH_SERVICE';

export const AUTH_SERVICE_TCP_OPTIONS = {
  name: AUTH_SERVICE_CLIENT,
  transport: Transport.TCP,
  options: {
    host: 'auth-service',
    port: 4000,
  },
} as const;
