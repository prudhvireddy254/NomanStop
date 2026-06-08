import {
    Body,
    Controller,
    Get,
    Inject,
    Param,
    Post,
    Put,
    UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AUTH_SERVICE_CLIENT } from '../common/constants/microservice.constants';
import type { JwtPayload } from '../common/decorators/current-user.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

// ─── Shared Error Shape ───────────────────────────────────────────────────────

interface MicroserviceError {
  error: string;
}

function isError(res: unknown): res is MicroserviceError {
  return typeof res === 'object' && res !== null && 'error' in res;
}

// ─── Request / Response Types ─────────────────────────────────────────────────

interface RegisterBody {
  username: string;
  password: string;
  email: string;
}

interface LoginBody {
  username: string;
  password: string;
}

interface ResetPasswordBody {
  username: string;
  newPassword: string;
}

interface UpdateProfileBody {
  username: string;
  firstName?: string;
  lastName?: string;
  age?: number;
  phoneNumber?: string;
  interests?: string[];
  bio?: string;
  location?: string;
  gender?: string;
}

// ─── Controller ───────────────────────────────────────────────────────────────

@Controller()
export class GatewayController {
  constructor(
    @Inject(AUTH_SERVICE_CLIENT)
    private readonly authClient: ClientProxy,
  ) {}

  @Get()
  healthCheck(): string {
    return 'NomanStop API Gateway is up ✅';
  }

  // ── Auth ────────────────────────────────────────────────────────────────────

  @Post('auth/register')
  async register(@Body() body: RegisterBody) {
    const response = await firstValueFrom(
      this.authClient.send<unknown, RegisterBody>({ cmd: 'register' }, body),
    );
    if (isError(response)) throw Object.assign(new Error(response.error), { status: 400 });
    return response;
  }

  @Post('auth/login')
  async login(@Body() body: LoginBody) {
    const response = await firstValueFrom(
      this.authClient.send<unknown, LoginBody>({ cmd: 'login' }, body),
    );
    if (isError(response)) throw Object.assign(new Error(response.error), { status: 401 });
    return response;
  }

  @Post('auth/reset-password')
  async resetPassword(@Body() body: ResetPasswordBody) {
    const response = await firstValueFrom(
      this.authClient.send<unknown, ResetPasswordBody>(
        { cmd: 'reset-password' },
        body,
      ),
    );
    if (isError(response)) throw Object.assign(new Error(response.error), { status: 400 });
    return response;
  }

  // ── Users ───────────────────────────────────────────────────────────────────

  @Get('users/:username')
  async getProfile(@Param('username') username: string) {
    const response = await firstValueFrom(
      this.authClient.send<unknown, string>({ cmd: 'get-profile' }, username),
    );
    if (isError(response)) throw Object.assign(new Error(response.error), { status: 404 });
    return response;
  }

  @Put('users/profile')
  async updateProfile(@Body() body: UpdateProfileBody) {
    const response = await firstValueFrom(
      this.authClient.send<unknown, UpdateProfileBody>(
        { cmd: 'update-profile' },
        body,
      ),
    );
    if (isError(response)) throw Object.assign(new Error(response.error), { status: 400 });
    return response;
  }

  // ── Protected ───────────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Get('private/data')
  getPrivateData(@CurrentUser() user: JwtPayload) {
    return {
      message: 'You have accessed protected data!',
      user,
    };
  }
}
