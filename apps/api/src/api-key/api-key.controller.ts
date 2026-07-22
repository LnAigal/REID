import { Controller, Post, Get, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApiKeyService } from './api-key.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { IsString, IsEnum, MinLength, MaxLength } from 'class-validator';

class CreateApiKeyDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsEnum(['LIVE', 'TEST'])
  type: 'LIVE' | 'TEST';
}

@ApiTags('api-keys')
@Controller('api-keys')
export class ApiKeyController {
  constructor(private apiKeyService: ApiKeyService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create an API key' })
  async create(@Req() req: Request, @Body() dto: CreateApiKeyDto) {
    const user = req.user as any;
    const result = await this.apiKeyService.create(user.id, dto.name, dto.type);
    return { success: true, data: result };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List API keys' })
  async list(@Req() req: Request) {
    const user = req.user as any;
    const result = await this.apiKeyService.findAll(user.id);
    return { success: true, data: result };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an API key' })
  async remove(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as any;
    return this.apiKeyService.remove(user.id, id);
  }

  @Post(':id/regenerate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Regenerate an API key' })
  async regenerate(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as any;
    const result = await this.apiKeyService.regenerate(user.id, id);
    return { success: true, data: result };
  }
}
