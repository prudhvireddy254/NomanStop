import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AppService {
  // Fake Database for testing (clears when server restarts)
  private users: any[] = [];

  constructor(private jwtService: JwtService) {}

  register(data: any) {
    const { username, password } = data;
    
    // Check if user already exists
    const existingUser = this.users.find(u => u.username === username);
    if (existingUser) {
      return { error: 'User already exists!' };
    }

    // Save the new user into our fake database
    const newUser = { id: this.users.length + 1, username, password };
    this.users.push(newUser);
    
    return { 
      message: 'User created successfully!', 
      user: { id: newUser.id, username: newUser.username } 
    };
  }

  login(data: any) {
    const { username, password } = data;
    
    // Check our fake database to find the user
    const user = this.users.find(u => u.username === username && u.password === password);
    
    if (user) {
      const payload = { username: user.username, sub: user.id };
      return {
        message: 'Login successful!',
        access_token: this.jwtService.sign(payload), // Generating the JWT
      };
    }
    
    // Return an error object through TCP
    return { error: 'Invalid username or password' };
  }

  resetPassword(data: any) {
    const { username, newPassword } = data;
    
    // 1. Find the user in our fake database
    const user = this.users.find(u => u.username === username);
    if (!user) {
      return { error: 'User does not exist!' };
    }

    // 2. Change the password
    user.password = newPassword;
    
    return { message: 'Password has been successfully reset!' };
  }
}
