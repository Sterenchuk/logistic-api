import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { DriversService } from 'src/drivers/drivers.service';
import { ConfigService } from '@nestjs/config'; // Import ConfigService

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly driversService: DriversService,
    private readonly configService: ConfigService, // Inject ConfigService
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const driver = await this.driversService.findOneByEmail(email);

    if (!driver || !(await bcrypt.compare(password, driver.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const { password: _, refreshToken: __, ...result } = driver;
    return result;
  }

  async login(driver: any) {
    const payload = { email: driver.email, sub: driver.id };

    // Use ConfigService for secrets and expiry times for better management
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.getOrThrow<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m', // Example: 15 minutes
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'), // Use a SEPARATE secret for refresh tokens
      expiresIn: this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN'), // Example: 7 days
    });

    // Hash the new refresh token before saving
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.driversService.saveRefreshedToken(driver.id, hashedRefreshToken);

    // Return the plain tokens to the client
    return { accessToken };
  }

  async refreshTokens(driverId: number, refreshToken: string): Promise<{ accessToken: string }> {
    const driver = await this.driversService.findOne(driverId);

    if (!driver || !driver.refreshToken) {
      throw new UnauthorizedException('Access Denied: User or refresh token not found.');
    }
    //optional for more safety
    const isMatch = await bcrypt.compare(refreshToken, driver.refreshToken);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    //  Verify JWT signature
    try {
      this.jwtService.verify(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch (err) {
      console.error('Refresh token verification failed:', err);
      throw new UnauthorizedException('Refresh token invalid or expired.');
    }

    const payload = { email: driver.email, sub: driver.id };

    const newAccessToken = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.getOrThrow<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m',
    });

    return { accessToken: newAccessToken };
  }
}
