import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

import { PrismaService } from '../../prisma/prisma.service';
import type {
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
} from './types/auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async register(data: RegisterPayload) {
    const username =
      typeof data?.username === 'string' ? data.username.trim() : '';
    const password = typeof data?.password === 'string' ? data.password : '';
    const email =
      typeof data?.email === 'string' ? data.email.trim().toLowerCase() : '';

    if (!username || !password || !email) {
      return { error: 'Username, password, and email are required.' };
    }

    const existingByUsername = await this.prisma.user.findUnique({
      where: { username },
    });
    if (existingByUsername) {
      return { error: 'User already exists!' };
    }

    const existingByEmail = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingByEmail) {
      return { error: 'Email is already registered.' };
    }

    const hashedPassword = await argon2.hash(password, {
      type: argon2.argon2id,
    });

    const newUser = await this.prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        email,
        interests: [],
      },
    });

    return {
      message: 'User created successfully!',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      },
    };
  }

  async login(data: LoginPayload) {
    const username = typeof data?.username === 'string' ? data.username : '';
    const password = typeof data?.password === 'string' ? data.password : '';

    const user = await this.prisma.user.findUnique({ where: { username } });

    const isValid =
      user !== null && (await argon2.verify(user.password, password));

    if (isValid) {
      const payload = { username: user!.username, sub: user!.id };
      return {
        message: 'Login successful!',
        access_token: this.jwtService.sign(payload),
      };
    }

    return { error: 'Invalid username or password' };
  }

  async resetPassword(data: ResetPasswordPayload) {
    const username = typeof data?.username === 'string' ? data.username : '';
    const newPassword =
      typeof data?.newPassword === 'string' ? data.newPassword : '';

    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) {
      return { error: 'User does not exist!' };
    }

    const hashedPassword = await argon2.hash(newPassword, {
      type: argon2.argon2id,
    });

    await this.prisma.user.update({
      where: { username },
      data: { password: hashedPassword },
    });

    return { message: 'Password has been successfully changed!' };
  }
}
