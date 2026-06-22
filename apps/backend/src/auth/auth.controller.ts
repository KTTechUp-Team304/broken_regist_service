import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../common/types/authenticated-user.type';
import {
  LoginDto,
  LoginResponseDto,
  LogoutResponseDto,
  RefreshResponseDto,
  RegisterDto,
  UserProfileDto,
} from './dto';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: '회원가입 및 토큰 발급' })
  @ApiCreatedResponse({ type: LoginResponseDto })
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Headers('user-agent') userAgent: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    const registerResult = await this.authService.register(dto, userAgent);
    response.cookie('refreshToken', registerResult.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/api/auth',
    });
    return registerResult;
  }

  @ApiOperation({ summary: '로그인 및 토큰 발급' })
  @ApiCreatedResponse({ type: LoginResponseDto })
  @ApiUnauthorizedResponse({ description: '로그인 실패' })
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Headers('user-agent') userAgent: string | undefined,
    @Res({ passthrough: true }) response: Response,
  ) {
    const loginResult = await this.authService.login(dto, userAgent);
    response.cookie('refreshToken', loginResult.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/api/auth',
    });
    return loginResult;
  }

  @ApiOperation({ summary: 'refresh token 기반 access token 재발급' })
  @ApiHeader({
    name: 'Cookie',
    required: true,
    description: 'refreshToken=<token> 형식의 쿠키',
  })
  @ApiCreatedResponse({
    type: RefreshResponseDto,
    description: 'access token 재발급 성공',
  })
  @ApiUnauthorizedResponse({
    description: '유효하지 않거나 폐기된 refresh token',
  })
  @Post('refresh')
  refresh(@Req() request: Request) {
    return this.authService.refresh(this.getRefreshTokenFromCookie(request));
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '로그아웃 및 refresh token 폐기' })
  @ApiHeader({
    name: 'Cookie',
    required: false,
    description: 'refreshToken=<token> 형식의 쿠키',
  })
  @ApiCreatedResponse({
    type: LogoutResponseDto,
    description: '로그아웃 처리 및 refresh token 폐기 완료',
  })
  @ApiUnauthorizedResponse({ description: '유효하지 않은 access token' })
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.logout(
      user.id,
      this.getRefreshTokenFromCookie(request),
    );
    response.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/api/auth',
    });
    return result;
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '현재 로그인 사용자 조회' })
  @ApiOkResponse({
    type: UserProfileDto,
    description: '현재 로그인 사용자 정보 반환',
  })
  @ApiUnauthorizedResponse({
    description: '유효하지 않거나 만료된 access token',
  })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.me(user.id);
  }

  private getRefreshTokenFromCookie(request: Request): string {
    const rawCookie = request.headers.cookie ?? '';
    return (
      rawCookie
        .split(';')
        .map((item) => item.trim())
        .find((item) => item.startsWith('refreshToken='))
        ?.replace('refreshToken=', '') ?? ''
    );
  }
}
