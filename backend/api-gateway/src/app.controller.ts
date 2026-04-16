import {
  Body,
  Controller,
  Get,
  Headers,
  Inject,
  Param,
  Post,
  Put,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

/** Error shape returned by the auth microservice on failed operations */
interface AuthMicroserviceError {
  error: string;
}

interface RegisterRequestBody {
  username: string;
  password: string;
  email: string;
}

interface RegisterSuccessBody {
  message: string;
  user: { id: number; username: string; email: string };
}

type RegisterMicroserviceResponse = RegisterSuccessBody | AuthMicroserviceError;

interface LoginRequestBody {
  username: string;
  password: string;
}

interface LoginSuccessBody {
  message: string;
  access_token: string;
}

type LoginMicroserviceResponse = LoginSuccessBody | AuthMicroserviceError;

interface ResetPasswordRequestBody {
  username: string;
  newPassword: string;
}

interface ResetPasswordSuccessBody {
  message: string;
}

type ResetPasswordMicroserviceResponse =
  | ResetPasswordSuccessBody
  | AuthMicroserviceError;

interface UpdateProfileRequestBody {
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

interface UpdateProfileSuccessBody {
  message: string;
  user: Record<string, unknown>;
}

type UpdateProfileMicroserviceResponse =
  | UpdateProfileSuccessBody
  | AuthMicroserviceError;

type GetProfileMicroserviceResponse =
  | Record<string, unknown>
  | AuthMicroserviceError;

@Controller()
export class AppController {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authClient: ClientProxy,
    private jwtService: JwtService,
  ) {}

  @Get()
  getHello(): string {
    return 'Welcome to the Secure API Gateway!';
  }

  @Post('auth/register')
  async register(@Body() body: RegisterRequestBody) {
    const response: RegisterMicroserviceResponse = await firstValueFrom(
      this.authClient.send<RegisterMicroserviceResponse, RegisterRequestBody>(
        { cmd: 'register' },
        body,
      ),
    );

    if ('error' in response) {
      throw new UnauthorizedException(response.error);
    }
    return response;
  }

  @Post('auth/login')
  async login(@Body() body: LoginRequestBody) {
    const response: LoginMicroserviceResponse = await firstValueFrom(
      this.authClient.send<LoginMicroserviceResponse, LoginRequestBody>(
        { cmd: 'login' },
        body,
      ),
    );

    if ('error' in response) {
      throw new UnauthorizedException(response.error);
    }
    return response;
  }

  @Post('auth/reset-password')
  async resetPassword(@Body() body: ResetPasswordRequestBody) {
    const response: ResetPasswordMicroserviceResponse = await firstValueFrom(
      this.authClient.send<
        ResetPasswordMicroserviceResponse,
        ResetPasswordRequestBody
      >({ cmd: 'reset-password' }, body),
    );

    if ('error' in response) {
      throw new UnauthorizedException(response.error);
    }
    return response;
  }

  @Get('private/data')
  getPrivateData(@Headers('authorization') authHeader: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Bearer token');
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = this.jwtService.verify<{ username: string; sub: number }>(
        token,
      );
      return {
        message: 'You have accessed private data!',
        user: payload,
      };
    } catch {
      throw new UnauthorizedException('Token is invalid or expired');
    }
  }

  @Put('users/profile')
  async updateProfile(@Body() body: UpdateProfileRequestBody) {
    const response: UpdateProfileMicroserviceResponse = await firstValueFrom(
      this.authClient.send<
        UpdateProfileMicroserviceResponse,
        UpdateProfileRequestBody
      >({ cmd: 'update-profile' }, body),
    );
    return response;
  }

  @Get('users/:username')
  async getProfile(@Param('username') username: string) {
    const response: GetProfileMicroserviceResponse = await firstValueFrom(
      this.authClient.send<GetProfileMicroserviceResponse, string>(
        { cmd: 'get-profile' },
        username,
      ),
    );
    return response;
  }
}
