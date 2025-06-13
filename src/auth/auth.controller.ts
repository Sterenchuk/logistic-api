import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './public/public.decorator'; // Assuming you have this decorator to bypass global guards

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public() // Mark login as public if you have a global JwtAuthGuard
  @Post('login')
  @HttpCode(HttpStatus.OK) // Explicitly set OK status on success
  async login(@Body() body: { email: string; password: string }) {
    // Add type for body
    console.log('Attempting login for:', body.email);
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      // Throw standard NestJS exception for consistency
      throw new UnauthorizedException('Invalid credentials');
    }
    // User is validated, now generate tokens
    return this.authService.login(user);
  }

  @Public() // Refresh endpoint might also need to be public depending on client implementation
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() body: { userId: number; refreshToken: string }) {
    try {
      return await this.authService.refreshTokens(body.userId, body.refreshToken);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.error('Refresh token error:', error);
      throw new UnauthorizedException('Could not refresh token.'); // Generic message
    }
  }
}
