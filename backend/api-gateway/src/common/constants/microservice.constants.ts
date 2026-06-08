import { Transport } from '@nestjs/microservices';

export const AUTH_SERVICE_CLIENT = 'AUTH_SERVICE';

const host = process.env.AUTH_SERVICE_HOST ?? 'auth-service';
const port = Number(process.env.AUTH_SERVICE_PORT ?? 4000);

export const AUTH_SERVICE_TCP_OPTIONS = {
  name: AUTH_SERVICE_CLIENT,
  transport: Transport.TCP,
  options: { host, port },
} as const;
