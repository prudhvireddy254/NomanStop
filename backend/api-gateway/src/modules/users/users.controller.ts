import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';

import { Commands } from '../../common/constants/commands';
import { AuthClientService } from '../../common/services/auth-client.service';
import type {
  CompleteOnboardingBody,
  UpdateProfileBody,
} from '../../common/types/microservice.types';

@Controller('users')
export class UsersController {
  constructor(private readonly authClient: AuthClientService) {}

  @Get(':username')
  async getProfile(@Param('username') username: string) {
    try {
      return await this.authClient.send(Commands.GET_PROFILE, username);
    } catch (err) {
      throw new NotFoundException(this.message(err));
    }
  }

  @Put('profile')
  async updateProfile(@Body() body: UpdateProfileBody) {
    try {
      return await this.authClient.send(Commands.UPDATE_PROFILE, body);
    } catch (err) {
      throw new BadRequestException(this.message(err));
    }
  }

  @Post('onboarding/complete')
  async completeOnboarding(@Body() body: CompleteOnboardingBody) {
    try {
      return await this.authClient.send(Commands.COMPLETE_ONBOARDING, body);
    } catch (err) {
      throw new BadRequestException(this.message(err));
    }
  }

  private message(err: unknown): string {
    return err instanceof Error ? err.message : 'Request failed';
  }
}
