import { Controller, Post, Get, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DomainService } from './domain.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { IsString, Matches } from 'class-validator';

class CreateDomainDto {
  @IsString()
  @Matches(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/)
  name: string;
}

@ApiTags('domains')
@Controller('domains')
export class DomainController {
  constructor(private domainService: DomainService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a domain' })
  async create(@Req() req: Request, @Body() dto: CreateDomainDto) {
    const user = req.user as any;
    const result = await this.domainService.create(user.id, dto.name);
    return { success: true, data: result };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List domains' })
  async list(@Req() req: Request) {
    const user = req.user as any;
    const result = await this.domainService.findAll(user.id);
    return { success: true, data: result };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get domain details' })
  async getOne(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as any;
    const result = await this.domainService.findOne(user.id, id);
    return { success: true, data: result };
  }

  @Post(':id/verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify domain' })
  async verify(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as any;
    const result = await this.domainService.verify(user.id, id);
    return { success: true, data: result };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete domain' })
  async remove(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as any;
    return this.domainService.remove(user.id, id);
  }
}
