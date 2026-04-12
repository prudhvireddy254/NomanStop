import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: 'nest-microservice-super-secret', // Remember to move this to env later
      signOptions: { expiresIn: '60m' },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
