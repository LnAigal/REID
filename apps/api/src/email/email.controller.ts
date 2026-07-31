import { Controller, Post, Get, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EmailService } from './email.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CsrfGuard } from '../auth/csrf.guard';
import { Request } from 'express';
import { Type } from 'class-transformer';
import { IsEmail, IsArray, IsOptional, IsString, IsObject, MaxLength, ArrayMinSize, IsInt, Min, Max } from 'class-validator';

class SendEmailDto {
  @IsEmail()
  from: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsEmail({}, { each: true })
  to: string[];

  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  cc?: string[];

  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  bcc?: string[];

  @IsOptional()
  @IsEmail()
  replyTo?: string;

  @IsString()
  subject: string;

  @IsOptional()
  @IsString()
  @MaxLength(50000)
  html?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50000)
  text?: string;

  @IsOptional()
  @IsObject()
  headers?: Record<string, string>;
}

class ListEmailsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  search?: string;
}

@ApiTags('emails')
@Controller('emails')
export class EmailController {
  constructor(private emailService: EmailService) {}

  @Post()
  @UseGuards(JwtAuthGuard, CsrfGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send an email' })
  async send(@Req() req: Request, @Body() dto: SendEmailDto) {
    const user = req.user!;
    const result = await this.emailService.send(user.id, dto, req.apiKeyId);
    return { success: true, data: result };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List emails' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  async list(
    @Req() req: Request,
    @Query() query: ListEmailsQueryDto,
  ) {
    const user = req.user!;
    const result = await this.emailService.getEmails(user.id, query.page, query.limit, query.search);
    return { success: true, ...result };
  }

  @Get('stats/overview')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get email statistics' })
  async stats(@Req() req: Request) {
    const user = req.user!;
    const result = await this.emailService.getEmailStats(user.id);
    return { success: true, data: result };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get email details' })
  async getOne(@Req() req: Request, @Param('id') id: string) {
    const user = req.user!;
    const result = await this.emailService.getEmailById(user.id, id);
    return { success: true, data: result };
  }
}
