import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ApiKeyService } from './api-key.service';
import { PrismaService } from '../prisma/prisma.service';
import { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private apiKeyService: ApiKeyService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer reid_')) {
      return false;
    }

    const rawKey = authHeader.slice(7);
    const result = await this.apiKeyService.validateKey(rawKey);
    if (!result) return false;

    const user = await this.prisma.user.findUnique({
      where: { id: result.userId },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) return false;

    request.user = user;
    request.apiKeyId = result.keyId;
    return true;
  }
}
