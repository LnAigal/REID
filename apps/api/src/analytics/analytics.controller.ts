import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('overview')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get analytics overview' })
  async getOverview(@Req() req: Request) {
    const user = req.user as any;
    const result = await this.analyticsService.getOverview(user.id);
    return { success: true, data: result };
  }

  @Get('chart')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get chart data' })
  @ApiQuery({ name: 'days', required: false })
  async getChartData(@Req() req: Request, @Query('days') days?: number) {
    const user = req.user as any;
    const result = await this.analyticsService.getChartData(user.id, days || 30);
    return { success: true, data: result };
  }
}
