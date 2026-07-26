import { Test, TestingModule } from '@nestjs/testing';
import { DomainService } from './domain.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('DomainService', () => {
  let service: DomainService;
  let prisma: { domain: { findUnique: jest.Mock; create: jest.Mock; findMany: jest.Mock; findFirst: jest.Mock; update: jest.Mock; deleteMany: jest.Mock } };

  beforeEach(async () => {
    prisma = {
      domain: {
        findUnique: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        deleteMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DomainService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DomainService>(DomainService);
  });

  describe('create', () => {
    it('should create a domain with DNS records', async () => {
      prisma.domain.findUnique.mockResolvedValue(null);
      prisma.domain.create.mockResolvedValue({ id: '1', name: 'test.com', records: [] });

      const result = await service.create('user1', 'test.com');

      expect(result.name).toBe('test.com');
      expect(prisma.domain.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException for duplicate domain', async () => {
      prisma.domain.findUnique.mockResolvedValue({ id: '1', name: 'test.com' });

      await expect(service.create('user1', 'test.com')).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all domains for a user', async () => {
      prisma.domain.findMany.mockResolvedValue([{ id: '1', name: 'test.com' }]);

      const result = await service.findAll('user1');

      expect(result).toHaveLength(1);
    });
  });

  describe('remove', () => {
    it('should delete an existing domain', async () => {
      prisma.domain.deleteMany.mockResolvedValue({ count: 1 });

      const result = await service.remove('user1', '1');

      expect(result.message).toBe('Domain deleted successfully');
    });

    it('should throw NotFoundException if domain not found', async () => {
      prisma.domain.deleteMany.mockResolvedValue({ count: 0 });

      await expect(service.remove('user1', 'nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
