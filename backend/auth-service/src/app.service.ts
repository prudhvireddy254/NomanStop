import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from './prisma.service';

@Injectable()
export class AppService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService
  ) {}

  async register(data: any) {
    const { username, password } = data;
    
    // 1. Check real Postgres database for existing user
    const existingUser = await this.prisma.user.findUnique({
      where: { username }
    });
    if (existingUser) {
      return { error: 'User already exists!' };
    }

    // 2. Save the new user permanently to Postgres
    const newUser = await this.prisma.user.create({
      data: { username, password }
    });
    
    return { 
      message: 'User created successfully in database!', 
      user: { id: newUser.id, username: newUser.username } 
    };
  }

  async login(data: any) {
    const { username, password } = data;
    
    // 1. Check real Postgres database for the user
    const user = await this.prisma.user.findUnique({
      where: { username }
    });
    
    // (In a real app, use bcrypt here to compare hashed passwords!)
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
    
    // 1. Verify user exists in Postgres
    const user = await this.prisma.user.findUnique({
      where: { username }
    });
    if (!user) {
      return { error: 'User does not exist!' };
    }

    // 2. Update the password in Postgres permanently
    await this.prisma.user.update({
      where: { username },
      data: { password: newPassword }
    });
    
    return { message: 'Password has been successfully changed in the database!' };
  }

  async updateProfile(data: any) {
    // The UI sends ONE giant object containing all the onboarding data at once!
    const { username, firstName, lastName, age, phoneNumber, interests, bio, location, gender } = data;
    
    // Update the database with whatever data the UI passed us
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
        gender
      }
    });

    return { message: 'Profile updated perfectly!', user: updatedUser };
  }

  async getProfile(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username }
    });

    if (!user) return { error: 'User not found' };

    // SECURE IT: Destructure to exclude password before returning to the Mobile UI
    const { password, ...safeUser } = user;
    return safeUser;
  }
}
