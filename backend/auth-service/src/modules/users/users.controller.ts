import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

import { Commands } from '../../common/constants/commands';
import type {
  CompleteOnboardingPayload,
  UpdateProfilePayload,
} from './types/users.types';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern({ cmd: Commands.GET_PROFILE })
  getProfile(username: string) {
    return this.usersService.getProfile(username);
  }

  @MessagePattern({ cmd: Commands.UPDATE_PROFILE })
  updateProfile(data: UpdateProfilePayload) {
    return this.usersService.updateProfile(data);
  }

  @MessagePattern({ cmd: Commands.COMPLETE_ONBOARDING })
  completeOnboarding(data: CompleteOnboardingPayload) {
    return this.usersService.completeOnboarding(data);
  }
}
