import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { findUnique: jest.Mock; create: jest.Mock; update: jest.Mock } };
  let jwt: { sign: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    jwt = { sign: jest.fn().mockReturnValue('mock-token') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('7d') } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('signup', () => {
    it('should create a new user and return token', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({ id: '1', email: 'test@test.com', name: 'Test', role: 'USER', tokenVersion: 0, createdAt: new Date() });

      const result = await service.signup('test@test.com', 'Test', 'Password1');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@test.com' } });
      expect(prisma.user.create).toHaveBeenCalled();
      expect(result.token).toBe('mock-token');
    });

    it('should throw ForbiddenException if email exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: '1', email: 'test@test.com' });

      await expect(service.signup('test@test.com', 'Test', 'Password1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('login', () => {
    it('should return token for valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('Password1', 12);
      prisma.user.findUnique.mockResolvedValue({ id: '1', email: 'test@test.com', password: hashedPassword, role: 'USER', name: 'Test', tokenVersion: 0, createdAt: new Date() });

      const result = await service.login('test@test.com', 'Password1');

      expect(result.token).toBe('mock-token');
      expect(result.user.email).toBe('test@test.com');
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login('wrong@test.com', 'Password1')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const hashedPassword = await bcrypt.hash('CorrectPassword1', 12);
      prisma.user.findUnique.mockResolvedValue({ id: '1', email: 'test@test.com', password: hashedPassword });

      await expect(service.login('test@test.com', 'WrongPassword1')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('changePassword', () => {
    it('should update password for valid current password', async () => {
      const hashedPassword = await bcrypt.hash('OldPass1', 12);
      prisma.user.findUnique.mockResolvedValue({ id: '1', password: hashedPassword, tokenVersion: 0 });
      prisma.user.update.mockResolvedValue({});

      const result = await service.changePassword('1', 'OldPass1', 'NewPass1');

      expect(result.message).toBe('Password updated successfully');
    });

    it('should throw for incorrect current password', async () => {
      const hashedPassword = await bcrypt.hash('CorrectPass1', 12);
      prisma.user.findUnique.mockResolvedValue({ id: '1', password: hashedPassword });

      await expect(service.changePassword('1', 'WrongPass1', 'NewPass1')).rejects.toThrow(UnauthorizedException);
    });
  });
});
