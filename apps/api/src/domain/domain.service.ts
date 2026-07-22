import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import * as dns from 'dns';

@Injectable()
export class DomainService {
  private readonly logger = new Logger(DomainService.name);

  constructor(private prisma: PrismaService) {}

  async create(userId: string, name: string) {
    const existing = await this.prisma.domain.findUnique({ where: { name } });
    if (existing) {
      throw new BadRequestException('Domain already exists');
    }

    const verificationToken = uuidv4();
    const dkimSelector = `reid._domainkey`;

    const domain = await this.prisma.domain.create({
      data: {
        name,
        verificationToken,
        dkimSelector,
        userId,
        records: {
          create: [
            {
              type: 'TXT',
              name: name,
              value: `v=spf1 include:reid.dev ~all`,
            },
            {
              type: 'CNAME',
              name: `${dkimSelector}.${name}`,
              value: `dkim.reid.dev`,
            },
            {
              type: 'TXT',
              name: `_dmarc.${name}`,
              value: `v=DMARC1; p=quarantine; rua=mailto:dmarc@reid.dev`,
            },
          ],
        },
      },
      include: { records: true },
    });

    return domain;
  }

  async findAll(userId: string) {
    return this.prisma.domain.findMany({
      where: { userId },
      include: { records: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, domainId: string) {
    const domain = await this.prisma.domain.findFirst({
      where: { id: domainId, userId },
      include: { records: true },
    });

    if (!domain) throw new NotFoundException('Domain not found');
    return domain;
  }

  async verify(userId: string, domainId: string) {
    const domain = await this.findOne(userId, domainId);

    const isVerified = await this.verifyTxtRecord(domain.name, domain.verificationToken);

    if (isVerified) {
      return this.prisma.domain.update({
        where: { id: domainId },
        data: {
          status: 'VERIFIED',
          verifiedAt: new Date(),
        },
        include: { records: true },
      });
    }

    return this.prisma.domain.update({
      where: { id: domainId },
      data: { status: 'FAILED' },
      include: { records: true },
    });
  }

  private async verifyTxtRecord(domain: string, token: string): Promise<boolean> {
    try {
      const records = await dns.promises.resolveTxt(domain);
      return records.some(record => record.join('').includes(token));
    } catch (error) {
      this.logger.warn(`DNS lookup failed for ${domain}: ${error.message}`);
      return false;
    }
  }

  async remove(userId: string, domainId: string) {
    const domain = await this.findOne(userId, domainId);
    await this.prisma.domain.delete({ where: { id: domainId } });
    return { message: 'Domain deleted successfully' };
  }
}
