import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TemplateService } from './template.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { IsString, MinLength, IsOptional } from 'class-validator';

class CreateTemplateDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @MinLength(1)
  subject: string;

  @IsString()
  html: string;

  @IsOptional()
  @IsString()
  text?: string;
}

@ApiTags('templates')
@Controller('templates')
export class TemplateController {
  constructor(private templateService: TemplateService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a template' })
  async create(@Req() req: Request, @Body() dto: CreateTemplateDto) {
    const user = req.user as any;
    const result = await this.templateService.create(user.id, dto);
    return { success: true, data: result };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List templates' })
  async list(@Req() req: Request) {
    const user = req.user as any;
    const result = await this.templateService.findAll(user.id);
    return { success: true, data: result };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get template details' })
  async getOne(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as any;
    const result = await this.templateService.findOne(user.id, id);
    return { success: true, data: result };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update template' })
  async update(@Req() req: Request, @Param('id') id: string, @Body() dto: Partial<CreateTemplateDto>) {
    const user = req.user as any;
    const result = await this.templateService.update(user.id, id, dto);
    return { success: true, data: result };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete template' })
  async remove(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as any;
    return this.templateService.remove(user.id, id);
  }
}
