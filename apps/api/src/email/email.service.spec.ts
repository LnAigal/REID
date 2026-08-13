import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

const row = {
  id: '1',
  from: 'sender@example.com',
  to: ['recipient@example.com'],
  cc: [],
  bcc: [],
  subject: 'Hello',
  status: 'SENT',
  provider: 'BREVO',
  latency: 42,
  errorMessage: null,
  sentAt: new Date(),
  deliveredAt: null,
  createdAt: new Date(),
};

describe('EmailService', () => {
  let service: EmailService;
  let prisma: {
    email: { findMany: jest.Mock; count: jest.Mock };
    $queryRaw: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      email: { findMany: jest.fn(), count: jest.fn() },
      $queryRaw: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        { provide: PrismaService, useValue: prisma },
        { provide: MailService, useValue: { send: jest.fn() } },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  describe('getEmails', () => {
    it('uses the Prisma query when no search is provided', async () => {
      prisma.email.findMany.mockResolvedValue([row]);
      prisma.email.count.mockResolvedValue(1);

      const result = await service.getEmails('user1');

      expect(result.pagination.total).toBe(1);
      expect(prisma.email.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user1' } }),
      );
      expect(prisma.$queryRaw).not.toHaveBeenCalled();
    });

    it('uses a partial-match raw query when searching recipients', async () => {
      prisma.$queryRaw
        .mockResolvedValueOnce([row])
        .mockResolvedValueOnce([{ count: 1 }]);

      const result = await service.getEmails('user1', 1, 20, 'recipient');

      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(prisma.email.findMany).not.toHaveBeenCalled();
      expect(prisma.$queryRaw).toHaveBeenCalledTimes(2);
    });

    it('escapes LIKE wildcards in the search pattern', async () => {
      prisma.$queryRaw.mockResolvedValueOnce([]).mockResolvedValueOnce([{ count: 0 }]);

      await service.getEmails('user1', 1, 20, '50%_off');

      const conditions = prisma.$queryRaw.mock.calls[0][1] as { values: unknown[] };
      expect(conditions.values[1]).toBe('%50\\%\\_off%');
    });
  });
});
