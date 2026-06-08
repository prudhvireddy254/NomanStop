import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UnauthorizedException,
} from '@nestjs/common';

import { Commands } from '../../common/constants/commands';
import { AuthClientService } from '../../common/services/auth-client.service';
import type {
  LoginBody,
  RegisterBody,
  ResetPasswordBody,
} from '../../common/types/microservice.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authClient: AuthClientService) {}

  @Post('register')
  async register(@Body() body: RegisterBody) {
    try {
      return await this.authClient.send(Commands.REGISTER, body);
    } catch (err) {
      throw new BadRequestException(this.message(err));
    }
  }

  @Post('login')
  async login(@Body() body: LoginBody) {
    try {
      return await this.authClient.send(Commands.LOGIN, body);
    } catch (err) {
      throw new UnauthorizedException(this.message(err));
    }
  }

  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordBody) {
    try {
      return await this.authClient.send(Commands.RESET_PASSWORD, body);
    } catch (err) {
      throw new BadRequestException(this.message(err));
    }
  }

  private message(err: unknown): string {
    return err instanceof Error ? err.message : 'Request failed';
  }
}
