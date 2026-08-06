import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { Response } from 'express';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  tokenVersion: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
    private mailService: MailService,
  ) {}

  async signup(email: string, name: string, password: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      // Do not reveal whether the email is already registered.
      return { user: null, token: null };
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = randomUUID();
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await this.prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        verificationToken,
        verificationTokenExpires,
      },
      select: { id: true, email: true, name: true, role: true, tokenVersion: true, createdAt: true, emailVerified: true },
    });

    const token = this.generateToken({ sub: user.id, email: user.email, role: user.role, tokenVersion: user.tokenVersion });

    if (!(await this.sendVerificationMail(user))) {
      this.logger.warn(`Verification email could not be sent for new user ${user.id}`);
    }

    return { user, token };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken({ sub: user.id, email: user.email, role: user.role, tokenVersion: user.tokenVersion });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        avatarUrl: true,
        createdAt: true,
        _count: {
          select: { apiKeys: true, domains: true, emails: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, data: { name?: string; avatarUrl?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) throw new UnauthorizedException('Current password is incorrect');

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword, tokenVersion: { increment: 1 } },
      select: { id: true, email: true, role: true, tokenVersion: true },
    });

    const token = this.generateToken({
      sub: updated.id,
      email: updated.email,
      role: updated.role,
      tokenVersion: updated.tokenVersion,
    });

    return { message: 'Password updated successfully', token };
  }

  async sendVerificationEmail(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    if (user.emailVerified) throw new BadRequestException('Email already verified');

    if (!(await this.sendVerificationMail(user))) {
      this.logger.error(`Verification email send failed for ${user.id}`);
      throw new BadRequestException('Failed to send verification email. Please try again.');
    }

    return { message: 'Verification email sent' };
  }

  private async sendVerificationMail(user: { id: string; email: string }): Promise<boolean> {
    const verificationToken = randomUUID();
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { verificationToken, verificationTokenExpires },
    });

    const appUrl = this.config.get('APP_URL', 'http://localhost:3000');
    const verifyLink = `${appUrl}/verify-email?token=${verificationToken}`;
    const appName = this.config.get('APP_NAME', 'REID');

    const result = await this.mailService.send({
      from: this.config.get('VERIFICATION_FROM_EMAIL', 'noreply@reid.dev'),
      to: [user.email],
      subject: `Verify your ${appName} email address`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Welcome to ${appName}!</h2>
          <p>Click the button below to verify your email address:</p>
          <a href="${verifyLink}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Verify Email</a>
          <p style="margin-top: 24px; color: #666;">Or copy this link: <br/><a href="${verifyLink}">${verifyLink}</a></p>
          <p style="color: #999; font-size: 12px;">This link expires in 24 hours.</p>
        </div>
      `,
      text: `Welcome to ${appName}! Verify your email by visiting: ${verifyLink}`,
    });

    return result.success;
  }

  async verifyEmail(token: string) {
    if (!token) throw new BadRequestException('Verification token is required');

    const user = await this.prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpires: { gte: new Date() },
      },
    });

    if (!user) throw new BadRequestException('Invalid or expired verification token');

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpires: null,
      },
    });

    return { message: 'Email verified successfully' };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { message: 'If that email exists, a reset link has been sent' };
    }

    const resetToken = randomUUID();
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordToken: resetToken, resetPasswordExpires: resetTokenExpires },
    });

    const appUrl = this.config.get('APP_URL', 'http://localhost:3000');
    const resetLink = `${appUrl}/reset-password?token=${resetToken}`;
    const appName = this.config.get('APP_NAME', 'REID');

    const result = await this.mailService.send({
      from: this.config.get('VERIFICATION_FROM_EMAIL', 'noreply@reid.dev'),
      to: [user.email],
      subject: `Reset your ${appName} password`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Password Reset</h2>
          <p>Click the button below to reset your password:</p>
          <a href="${resetLink}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Reset Password</a>
          <p style="margin-top: 24px; color: #666;">Or copy this link: <br/><a href="${resetLink}">${resetLink}</a></p>
          <p style="color: #999; font-size: 12px;">This link expires in 1 hour.</p>
          <p style="color: #999; font-size: 12px;">If you didn't request this, you can ignore this email.</p>
        </div>
      `,
      text: `Reset your ${appName} password by visiting: ${resetLink}. This link expires in 1 hour.`,
    });

    if (!result.success) {
      this.logger.error(`Password reset email send failed for ${user.id}: ${result.error}`);
    }

    return { message: 'If that email exists, a reset link has been sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gte: new Date() },
      },
    });

    if (!user) throw new BadRequestException('Invalid or expired reset token');

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        tokenVersion: { increment: 1 },
      },
    });

    return { message: 'Password reset successfully' };
  }

  async validateToken(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }

  setAuthCookie(res: Response, token: string) {
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  clearAuthCookie(res: Response) {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  }

  private generateToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      expiresIn: this.config.get('JWT_EXPIRATION', '7d'),
    });
  }
}
