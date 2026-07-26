import { Test, TestingModule } from '@nestjs/testing';
import { ApiKeyService } from './api-key.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('ApiKeyService', () => {
  let service: ApiKeyService;
  let prisma: { apiKey: { create: jest.Mock; findMany: jest.Mock; findFirst: jest.Mock; delete: jest.Mock; update: jest.Mock } };

  beforeEach(async () => {
    prisma = {
      apiKey: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        delete: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiKeyService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ApiKeyService>(ApiKeyService);
  });

  describe('create', () => {
    it('should create an API key with correct prefix', async () => {
      prisma.apiKey.create.mockResolvedValue({ id: '1', name: 'test', prefix: 'reid_live_a...', type: 'LIVE', createdAt: new Date() });

      const result = await service.create('user1', 'test', 'LIVE');

      expect(result.key).toMatch(/^reid_live_/);
      expect(result.name).toBe('test');
      expect(prisma.apiKey.create).toHaveBeenCalled();
    });

    it('should create TEST key with correct prefix', async () => {
      prisma.apiKey.create.mockResolvedValue({ id: '1', name: 'test', prefix: 'reid_test_a...', type: 'TEST', createdAt: new Date() });

      const result = await service.create('user1', 'test', 'TEST');

      expect(result.key).toMatch(/^reid_test_/);
    });
  });

  describe('findAll', () => {
    it('should return all keys for a user', async () => {
      prisma.apiKey.findMany.mockResolvedValue([{ id: '1', name: 'key1' }]);

      const result = await service.findAll('user1');

      expect(result).toHaveLength(1);
      expect(prisma.apiKey.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: 'user1' } }));
    });
  });

  describe('remove', () => {
    it('should delete an existing key', async () => {
      prisma.apiKey.findFirst.mockResolvedValue({ id: '1', userId: 'user1' });
      prisma.apiKey.delete.mockResolvedValue({});

      const result = await service.remove('user1', '1');

      expect(result.message).toBe('API key deleted successfully');
    });

    it('should throw NotFoundException if key not found', async () => {
      prisma.apiKey.findFirst.mockResolvedValue(null);

      await expect(service.remove('user1', 'nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
