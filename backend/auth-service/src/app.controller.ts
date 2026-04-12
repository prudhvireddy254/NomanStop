import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern({ cmd: 'register' })
  register(data: any) {
    return this.appService.register(data);
  }

  @MessagePattern({ cmd: 'login' })
  login(data: any) {
    return this.appService.login(data);
  }

  @MessagePattern({ cmd: 'reset-password' })
  resetPassword(data: any) {
    return this.appService.resetPassword(data);
  }
}
