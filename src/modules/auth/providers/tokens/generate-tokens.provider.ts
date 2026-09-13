import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../../config/jwt.config.js';
import type { ConfigType } from '@nestjs/config';
import { User } from '../../../users/entities/user.entity.js';
import { ActiveUserData } from '../../interfaces/active-user-data.interface.js';
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

  public async generateTokens(user: User) {
    const [accessToken, refreshToken] = await Promise.all([
      // generate the accessToken
      this.signToken<Partial<ActiveUserData>>(
        user.id,
        this.jwtConfiguration.accessTokenTtl,
        this.jwtConfiguration.secret,
        {
          email: user.email,
        },
      ),
      // generate the refreshToken
      this.signToken(
        user.id,
        this.jwtConfiguration.refreshTokenTtl,
        this.jwtConfiguration.refreshTokenSecret,
      ),
    ]);

    return { accessToken, refreshToken };
  }
}
