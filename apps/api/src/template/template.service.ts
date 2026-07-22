import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TemplateService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: { name: string; subject: string; html: string; text?: string; variables?: Record<string, string> }) {
    return this.prisma.template.create({
      data: {
        ...data,
        variables: data.variables as any,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.template.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, templateId: string) {
    const template = await this.prisma.template.findFirst({
      where: { id: templateId, userId },
    });
    if (!template) throw new NotFoundException('Template not found');
    return template;
  }

  async update(userId: string, templateId: string, data: Partial<{ name: string; subject: string; html: string; text: string }>) {
    await this.findOne(userId, templateId);
    return this.prisma.template.update({
      where: { id: templateId },
      data,
    });
  }

  async remove(userId: string, templateId: string) {
    await this.findOne(userId, templateId);
    await this.prisma.template.delete({ where: { id: templateId } });
    return { message: 'Template deleted successfully' };
  }
}
