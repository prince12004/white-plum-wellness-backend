import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { parseDurationToMs } from '../../common/utils/duration.util';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { JwtRefreshGuard } from '../../common/guards/jwt-refresh.guard';
import { AuditLogService } from '../audit-log/audit-log.service';
import { UsersService } from '../users/users.service';
import { AuthService, AuthTokens } from './auth.service';
import { LoginDto } from './dto/login.dto';
import type { JwtRefreshPayload, RequestUser } from './types/jwt-payload.type';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly auditLogService: AuditLogService,
    private readonly configService: ConfigService,
  ) {}

  private setAuthCookies(res: Response, tokens: AuthTokens) {
    const isProd = this.configService.get<string>('nodeEnv') === 'production';
    const domain = this.configService.get<string>('cookieDomain');

    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      domain,
      path: '/',
      maxAge: parseDurationToMs(tokens.accessTtl),
    });
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      domain,
      path: '/',
      maxAge: parseDurationToMs(tokens.refreshTtl),
    });
  }

  private clearAuthCookies(res: Response) {
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.validateCredentials(dto);
    const tokens = await this.authService.issueTokens(user);
    this.setAuthCookies(res, tokens);
    await this.usersService.recordLogin(String(user._id));

    await this.auditLogService.record({
      actorId: String(user._id),
      actorEmail: user.email,
      action: 'LOGIN',
      module: 'auth',
      req,
    });

    return {
      user: { id: String(user._id), name: user.name, email: user.email },
      accessToken: tokens.accessToken,
    };
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(200)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const payload = req.user as JwtRefreshPayload;
    const presentedToken = req.cookies?.refresh_token as string;
    const tokens = await this.authService.refresh(payload, presentedToken);
    this.setAuthCookies(res, tokens);
    return { accessToken: tokens.accessToken };
  }

  @Post('logout')
  @HttpCode(200)
  async logout(
    @CurrentUser() user: RequestUser,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(user.userId);
    this.clearAuthCookies(res);
    await this.auditLogService.record({
      actorId: user.userId,
      actorEmail: user.email,
      action: 'LOGOUT',
      module: 'auth',
      req,
    });
    return { success: true };
  }

  @Get('me')
  async me(@CurrentUser() user: RequestUser) {
    const fullUser = await this.usersService.findById(user.userId);
    return { ...fullUser, permissions: user.permissions, roleKey: user.roleKey };
  }
}
