import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

@Injectable()
export class ApiKeyService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, name: string, type: 'LIVE' | 'TEST') {
    const rawKey = uuidv4().replace(/-/g, '');
    const prefix = type === 'LIVE' ? 'reid_live' : 'reid_test';
    const key = `${prefix}_${rawKey}`;
    const keyPrefix = `${key.substring(0, 12)}...`;

    const apiKey = await this.prisma.apiKey.create({
      data: {
        name,
        key: await this.hashKey(key),
        prefix: keyPrefix,
        type,
        userId,
      },
    });

    return {
      id: apiKey.id,
      name: apiKey.name,
      key,
      prefix: apiKey.prefix,
      type: apiKey.type,
      createdAt: apiKey.createdAt,
    };
  }

  async findAll(userId: string) {
    return this.prisma.apiKey.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        prefix: true,
        type: true,
        isActive: true,
        lastUsed: true,
        expiresAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(userId: string, keyId: string) {
    const apiKey = await this.prisma.apiKey.findFirst({
      where: { id: keyId, userId },
    });

    if (!apiKey) throw new NotFoundException('API key not found');

    await this.prisma.apiKey.delete({ where: { id: keyId } });
    return { message: 'API key deleted successfully' };
  }

  async regenerate(userId: string, keyId: string) {
    const apiKey = await this.prisma.apiKey.findFirst({
      where: { id: keyId, userId },
    });

    if (!apiKey) throw new NotFoundException('API key not found');

    const rawKey = uuidv4().replace(/-/g, '');
    const prefix = apiKey.type === 'LIVE' ? 'reid_live' : 'reid_test';
    const key = `${prefix}_${rawKey}`;
    const keyPrefix = `${key.substring(0, 12)}...`;

    const updated = await this.prisma.apiKey.update({
      where: { id: keyId },
      data: {
        key: await this.hashKey(key),
        prefix: keyPrefix,
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      key,
      prefix: updated.prefix,
      type: updated.type,
      createdAt: updated.createdAt,
    };
  }

  async validateKey(rawKey: string): Promise<{ userId: string; keyId: string } | null> {
    const prefix = rawKey.startsWith('reid_live_') ? 'reid_live' : 'reid_test';
    const keyPrefix = `${rawKey.substring(0, 12)}...`;
    const hashedRawKey = await this.hashKey(rawKey);

    const apiKey = await this.prisma.apiKey.findFirst({
      where: {
        prefix: keyPrefix,
        type: prefix === 'reid_live' ? 'LIVE' : 'TEST',
        isActive: true,
      },
      include: { user: { select: { id: true } } },
    });

    if (!apiKey) return null;

    if (apiKey.key !== hashedRawKey) return null;

    await this.prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsed: new Date() },
    });

    return { userId: apiKey.user.id, keyId: apiKey.id };
  }

  private async hashKey(key: string): Promise<string> {
    return crypto.createHash('sha256').update(key).digest('hex');
  }
}
