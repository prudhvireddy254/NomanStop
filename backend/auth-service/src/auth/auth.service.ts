import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma.service';

// ─── Payload Types ────────────────────────────────────────────────────────────

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

export interface CompleteOnboardingPayload {
  username?: string;
  interests?: string[];
  following?: string[];
}

// ─── Service ──────────────────────────────────────────────────────────────────

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

    // Hash with Argon2id (recommended variant — resistant to side-channel + GPU attacks)
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

    // Verify password against the stored Argon2 hash
    const isValid =
      user !== null && (await argon2.verify(user.password, password));

    if (isValid) {
      const payload = { username: user!.username, sub: user!.id };
      return {
        message: 'Login successful!',
        access_token: this.jwtService.sign(payload),
      };
    }

    // Identical error message for both "user not found" and "wrong password"
    // to prevent username enumeration
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

    return { message: 'Profile updated successfully!', user: updatedUser };
  }

  async completeOnboarding(data: CompleteOnboardingPayload) {
    const username =
      typeof data?.username === 'string' ? data.username.trim() : '';
    const interests = Array.isArray(data?.interests) ? data.interests : [];
    const following = Array.isArray(data?.following) ? data.following : [];

    if (!username) {
      return { error: 'Username is required.' };
    }
    if (interests.length === 0) {
      return { error: 'At least one interest is required.' };
    }

    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) {
      return { error: 'User not found' };
    }

    await this.prisma.user.update({
      where: { username },
      data: { interests },
    });

    if (following.length > 0) {
      const targetUsers = await this.prisma.user.findMany({
        where: {
          username: { in: following },
          NOT: { id: user.id },
        },
        select: { id: true },
      });

      if (targetUsers.length > 0) {
        await this.prisma.follow.createMany({
          data: targetUsers.map((target) => ({
            followerId: user.id,
            followingId: target.id,
          })),
          skipDuplicates: true,
        });
      }
    }

    return { message: 'Onboarding completed successfully!' };
  }

  async getProfile(username: string) {
    const user = await this.prisma.user.findUnique({ where: { username } });

    if (!user) return { error: 'User not found' };

    // Never expose the password hash
    const { password: _password, ...safeUser } = user;
    return safeUser;
  }
}
