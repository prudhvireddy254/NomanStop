import { Body, Controller, Get, Headers, Inject, Param, Post, Put, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller()
export class AppController {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authClient: ClientProxy,
    private jwtService: JwtService
  ) { }

  @Get()
  getHello(): string {
    return 'Welcome to the Secure API Gateway!';
  }

  @Post('auth/register')
  async register(@Body() body: any) {
    // The Gateway passes the registration request to the Auth Microservice
    const response = await firstValueFrom(this.authClient.send({ cmd: 'register' }, body));

    if (response.error) {
      throw new UnauthorizedException(response.error);
    }
    return response;
  }

  @Post('auth/login')
  async login(@Body() body: any) {
    // The Gateway passes the login request to the Auth Microservice
    const response = await firstValueFrom(this.authClient.send({ cmd: 'login' }, body));

    if (response.error) {
      throw new UnauthorizedException(response.error);
    }
    return response;
  }

  @Post('auth/reset-password')
  async resetPassword(@Body() body: any) {
    // The Gateway passes the reset request to the Auth Microservice
    const response = await firstValueFrom(this.authClient.send({ cmd: 'reset-password' }, body));

    if (response.error) {
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
      const payload = this.jwtService.verify(token);
      return {
        message: 'You have accessed private data!',
        user: payload,
      };
    } catch (e) {
      throw new UnauthorizedException('Token is invalid or expired');
    }
  }

  @Put('users/profile')
  async updateProfile(@Body() body: any) {
    // Passes the giant UI object to the Auth Service
    const response = await firstValueFrom(this.authClient.send({ cmd: 'update-profile' }, body));
    return response;
  }

  @Get('users/:username')
  async getProfile(@Param('username') username: string) {
    // Asks the Auth Service for the requested profile data
    const response = await firstValueFrom(this.authClient.send({ cmd: 'get-profile' }, username));
    return response;
  }
}
