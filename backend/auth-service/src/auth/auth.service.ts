import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async register(data: any) {
    const username = typeof data?.username === 'string' ? data.username.trim() : '';
    const password = typeof data?.password === 'string' ? data.password : '';
    const email = typeof data?.email === 'string' ? data.email.trim().toLowerCase() : '';

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
      user: { id: newUser.id, username: newUser.username, email: newUser.email },
    };
  }

  async login(data: any) {
    const { username, password } = data;

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

  async resetPassword(data: any) {
    const { username, newPassword } = data;

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

    return { message: 'Password has been successfully changed in the database!' };
  }

  async updateProfile(data: any) {
    const { username, firstName, lastName, age, phoneNumber, interests, bio, location, gender } =
      data;

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

    const { password, ...safeUser } = user;
    return safeUser;
  }
}
