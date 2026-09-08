import { Injectable } from '@nestjs/common';
import { prisma } from '@repo/database';

@Injectable()
export class PrismaService {
  readonly user = prisma.user;
  readonly apiKey = prisma.apiKey;
  readonly domain = prisma.domain;
  readonly domainRecord = prisma.domainRecord;
  readonly email = prisma.email;
  readonly emailEvent = prisma.emailEvent;
  readonly template = prisma.template;
  readonly $transaction = prisma.$transaction.bind(prisma);
  readonly $queryRaw = prisma.$queryRaw.bind(prisma);
  readonly $connect = prisma.$connect.bind(prisma);
  readonly $disconnect = prisma.$disconnect.bind(prisma);
}
