import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import type {
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  UpdateProfilePayload,
} from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'register' })
  register(data: RegisterPayload) {
    return this.authService.register(data);
  }

  @MessagePattern({ cmd: 'login' })
  login(data: LoginPayload) {
    return this.authService.login(data);
  }

  @MessagePattern({ cmd: 'reset-password' })
  resetPassword(data: ResetPasswordPayload) {
    return this.authService.resetPassword(data);
  }

  @MessagePattern({ cmd: 'update-profile' })
  updateProfile(data: UpdateProfilePayload) {
    return this.authService.updateProfile(data);
  }

  @MessagePattern({ cmd: 'get-profile' })
  getProfile(username: string) {
    return this.authService.getProfile(username);
  }
}
