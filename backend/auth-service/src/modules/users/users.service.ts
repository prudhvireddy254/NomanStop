import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import type {
  CompleteOnboardingPayload,
  UpdateProfilePayload,
} from './types/users.types';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(username: string) {
    const user = await this.prisma.user.findUnique({ where: { username } });

    if (!user) return { error: 'User not found' };

    const { password: _password, ...safeUser } = user;
    return safeUser;
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
}
