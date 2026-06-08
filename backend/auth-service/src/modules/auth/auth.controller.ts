import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

import { Commands } from '../../common/constants/commands';
import { AuthService } from './auth.service';
import type {
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
} from './types/auth.types';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: Commands.REGISTER })
  register(data: RegisterPayload) {
    return this.authService.register(data);
  }

  @MessagePattern({ cmd: Commands.LOGIN })
  login(data: LoginPayload) {
    return this.authService.login(data);
  }

  @MessagePattern({ cmd: Commands.RESET_PASSWORD })
  resetPassword(data: ResetPasswordPayload) {
    return this.authService.resetPassword(data);
  }
}
