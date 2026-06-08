import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get()
  healthCheck(): string {
    return 'NomanStop API Gateway is up ✅';
  }
}
