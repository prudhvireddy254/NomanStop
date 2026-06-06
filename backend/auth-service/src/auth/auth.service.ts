import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';

export interface RegisterPayload {
  username?: string;
  password?: string;
  email?: string;
}

export interface LoginPayload {
  username?: string;
  password?: string;
}

export interface ResetPasswordPayload {
  username?: string;
  newPassword?: string;
}

export interface UpdateProfilePayload {
  username?: string;
  firstName?: string;
  lastName?: string;
  age?: number;
  phoneNumber?: string;
  interests?: string[];
  bio?: string;
  location?: string;
  gender?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
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

    const newUser = await this.prisma.user.create({
      data: {
        username,
        password,
        email,
        interests: [],
      },
    });

    return {
      message: 'User created successfully in database!',
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

    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (user && user.password === password) {
      const payload = { username: user.username, sub: user.id };
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

    const user = await this.prisma.user.findUnique({
      where: { username },
    });
    if (!user) {
      return { error: 'User does not exist!' };
    }

    await this.prisma.user.update({
      where: { username },
      data: { password: newPassword },
    });

    return {
      message: 'Password has been successfully changed in the database!',
    };
  }

  async updateProfile(data: UpdateProfilePayload) {
    const username = typeof data?.username === 'string' ? data.username : '';
    const firstName =
      typeof data?.firstName === 'string' ? data.firstName : undefined;
    const lastName =
      typeof data?.lastName === 'string' ? data.lastName : undefined;
    const age = typeof data?.age === 'number' ? data.age : undefined;
    const phoneNumber =
      typeof data?.phoneNumber === 'string' ? data.phoneNumber : undefined;
    const interests = Array.isArray(data?.interests)
      ? data.interests
      : undefined;
    const bio = typeof data?.bio === 'string' ? data.bio : undefined;
    const location =
      typeof data?.location === 'string' ? data.location : undefined;
    const gender = typeof data?.gender === 'string' ? data.gender : undefined;

    const updatedUser = await this.prisma.user.update({
      where: { username },
      data: {
        firstName,
        lastName,
        age,
        phoneNumber,
        interests,
        bio,
        location,
        gender,
      },
    });

    return { message: 'Profile updated perfectly!', user: updatedUser };
  }

  async getProfile(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) return { error: 'User not found' };

    const safeUser = { ...user } as Partial<typeof user>;
    delete safeUser.password;
    return safeUser;
  }
}
