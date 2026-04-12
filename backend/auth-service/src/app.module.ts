import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from './prisma.service';

@Module({
  imports: [
    JwtModule.register({
      secret: 'nest-microservice-super-secret', // Remember to move this to env later
      signOptions: { expiresIn: '60m' },
    }),
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
