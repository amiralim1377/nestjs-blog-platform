import {
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { UsersService as UsersServiceType } from '../../../users/providers/users.service.js';
import { UsersService } from '../../../users/providers/users.service.js';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../../config/jwt.config.js';
import type { ConfigType } from '@nestjs/config';
import { GenerateTokensProvider } from '../tokens/generate-tokens.provider.js';
import { RefreshTokenDto } from '../../dto/refresh-token.dto.js';
import { ActiveUserData } from '../../interfaces/active-user-data.interface.js';

@Injectable()
export class RefreshTokensProvider {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersServiceType,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly generateTokensProvider: GenerateTokensProvider,
  ) {}

  public async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    try {
      // verify the refresh token using jwtservice

      const { sub } = await this.jwtService.verifyAsync<
        Pick<ActiveUserData, 'sub'>
      >(refreshTokenDto.refreshToken, {
        secret: this.jwtConfiguration.secret,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
      });

      //fetch user from the database
      const user = await this.usersService.findById(sub);

      if (!user) {
        throw new UnauthorizedException('User no longer exists');
      }

      // Generate the tokens
      return await this.generateTokensProvider.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }
}
