import { Controller, Post, Get, Body, Req, Res, UseGuards, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Request, Response } from 'express';
import { IsEmail, IsString, MinLength, MaxLength, IsOptional, Matches } from 'class-validator';
import { RequestUser } from '../types/request-user';

class SignupDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsString()
  @MinLength(8)
  @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  @Matches(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
  @Matches(/[0-9]/, { message: 'Password must contain at least one number' })
  password: string;
}

class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}

class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(8)
  @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  @Matches(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
  @Matches(/[0-9]/, { message: 'Password must contain at least one number' })
  newPassword: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Create a new account' })
  @ApiResponse({ status: 201, description: 'Account created successfully' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  async signup(@Body() dto: SignupDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.signup(dto.email, dto.name, dto.password);
    this.authService.setAuthCookie(res, result.token);
    return { success: true, data: result };
  }

  @Post('login')
  @ApiOperation({ summary: 'Sign in to your account' })
  @ApiResponse({ status: 200, description: 'Signed in successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto.email, dto.password);
    this.authService.setAuthCookie(res, result.token);
    return { success: true, data: result };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sign out' })
  async logout(@Res({ passthrough: true }) res: Response) {
    this.authService.clearAuthCookie(res);
    return { success: true, message: 'Logged out successfully' };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@Req() req: Request) {
    const user = req.user!;
    const profile = await this.authService.getProfile(user.id);
    return { success: true, data: profile };
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update profile' })
  async updateProfile(@Req() req: Request, @Body() dto: UpdateProfileDto) {
    const user = req.user!;
    const updated = await this.authService.updateProfile(user.id, dto);
    return { success: true, data: updated };
  }

  @Patch('password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password' })
  async changePassword(@Req() req: Request, @Body() dto: ChangePasswordDto) {
    const user = req.user!;
    return this.authService.changePassword(user.id, dto.currentPassword, dto.newPassword);
  }
}
