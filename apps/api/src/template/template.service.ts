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
    const template = await this.prisma.template.updateMany({
      where: { id: templateId, userId },
      data,
    });
    if (template.count === 0) throw new NotFoundException('Template not found');
    return this.prisma.template.findFirst({ where: { id: templateId, userId } });
  }

  async remove(userId: string, templateId: string) {
    const result = await this.prisma.template.deleteMany({
      where: { id: templateId, userId },
    });
    if (result.count === 0) throw new NotFoundException('Template not found');
    return { message: 'Template deleted successfully' };
  }
}
