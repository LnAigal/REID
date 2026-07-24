import { Controller, Post, Get, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EmailService } from './email.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { IsEmail, IsArray, IsOptional, IsString, IsObject } from 'class-validator';
import { RequestUser } from '../types/request-user';

class SendEmailDto {
  @IsEmail()
  from: string;

  @IsArray()
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
  html?: string;

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsObject()
  headers?: Record<string, string>;
}

@ApiTags('emails')
@Controller('emails')
export class EmailController {
  constructor(private emailService: EmailService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send an email' })
  async send(@Req() req: Request, @Body() dto: SendEmailDto) {
    const user = req.user!;
    const result = await this.emailService.send(user.id, dto);
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
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    const user = req.user!;
    const result = await this.emailService.getEmails(user.id, page || 1, limit || 20, search);
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
