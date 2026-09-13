import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../../config/jwt.config.js';
import type { ConfigType } from '@nestjs/config';
import { User } from '../../../users/entities/user.entity.js';
import type { ActiveUserData } from '../../interfaces/active-user-data.interface.js';
import { randomUUID } from 'crypto';

@Injectable()
export class GenerateTokensProvider {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  public async signToken<T>(
    userId: string,
    expiresIn: number,
    secret: string,
    payload?: T,
  ) {
    const jwtId = randomUUID();

    return await this.jwtService.signAsync(
      {
        sub: String(userId),
        ...payload,
      },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: secret,
        expiresIn,
        jwtid: jwtId,
      },
    );
  }

  public async generateTokens(user: User, familyId?: string) {
    const currentFamilyId = familyId || randomUUID();

    const [accessToken, refreshToken] = await Promise.all([
      // Generate the Access Token
      this.signToken<Partial<ActiveUserData> & { familyId: string }>(
        user.id,
        this.jwtConfiguration.accessTokenTtl,
        this.jwtConfiguration.secret,
        {
          email: user.email,
          familyId: currentFamilyId,
        },
      ),

      // Generate the Refresh Token
      this.signToken<{ familyId: string }>(
        user.id,
        this.jwtConfiguration.refreshTokenTtl,
        this.jwtConfiguration.refreshTokenSecret,
        {
          familyId: currentFamilyId,
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }
}
