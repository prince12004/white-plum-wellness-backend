import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { randomUUID } from 'crypto';
import { hashValue, verifyHash } from '../../common/utils/hash.util';
import { RolesService } from '../roles/roles.service';
import { UsersService } from '../users/users.service';
import type { UserDocument } from '../users/schemas/user.schema';
import type { Role } from '../roles/schemas/role.schema';
import { LoginDto } from './dto/login.dto';
import type { JwtAccessPayload, JwtRefreshPayload } from './types/jwt-payload.type';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  accessTtl: string;
  refreshTtl: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateCredentials(dto: LoginDto): Promise<UserDocument> {
    const user = await this.usersService.findByEmailWithPassword(dto.email);
    if (!user) throw new UnauthorizedException('Invalid email or password');
    if (user.status !== 'ACTIVE') throw new UnauthorizedException('This account is not active');

    const valid = await verifyHash(user.passwordHash, dto.password);
    if (!valid) throw new UnauthorizedException('Invalid email or password');

    return user;
  }

  async issueTokens(user: UserDocument): Promise<AuthTokens> {
    const role = user.role as unknown as Role;
    const { roleKey, permissions } = await this.rolesService.getPermissionKeysForRole(role._id as any);

    const accessPayload: JwtAccessPayload = {
      sub: String(user._id),
      email: user.email,
      roleKey,
      permissions,
    };

    const accessTtl = this.configService.get<string>('jwt.accessTtl') as string;
    const refreshTtl = this.configService.get<string>('jwt.refreshTtl') as string;

    const accessToken = this.jwtService.sign(accessPayload, {
      secret: this.configService.get<string>('jwt.accessSecret'),
      expiresIn: accessTtl,
    });

    const tokenVersion = randomUUID();
    const refreshPayload: JwtRefreshPayload = { sub: String(user._id), tokenVersion };
    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: refreshTtl,
    });

    await this.usersService.setRefreshTokenHash(String(user._id), await hashValue(refreshToken));

    return { accessToken, refreshToken, accessTtl, refreshTtl };
  }

  async refresh(payload: JwtRefreshPayload, presentedToken: string): Promise<AuthTokens> {
    const user = await this.usersService.findByIdWithRefreshHash(payload.sub);
    if (!user || !user.refreshTokenHash) throw new UnauthorizedException('Session expired, please log in again');

    const matches = await verifyHash(user.refreshTokenHash, presentedToken);
    if (!matches) {
      // Presented refresh token doesn't match the last-issued one: possible reuse/theft.
      await this.usersService.setRefreshTokenHash(String(user._id), null);
      throw new UnauthorizedException('Session expired, please log in again');
    }

    return this.issueTokens(user);
  }

  async logout(userId: string) {
    await this.usersService.setRefreshTokenHash(userId, null);
  }

  buildRequestMeta(req: Request) {
    return { ip: req.ip, userAgent: req.headers['user-agent'] };
  }
}
