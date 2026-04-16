import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'register' })
  register(data: any) {
    return this.authService.register(data);
  }

  @MessagePattern({ cmd: 'login' })
  login(data: any) {
    return this.authService.login(data);
  }

  @MessagePattern({ cmd: 'reset-password' })
  resetPassword(data: any) {
    return this.authService.resetPassword(data);
  }

  @MessagePattern({ cmd: 'update-profile' })
  updateProfile(data: any) {
    return this.authService.updateProfile(data);
  }

  @MessagePattern({ cmd: 'get-profile' })
  getProfile(username: string) {
    return this.authService.getProfile(username);
  }
}
