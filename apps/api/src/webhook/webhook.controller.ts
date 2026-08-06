import { Controller, Post, Param, Req, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { Request } from 'express';
import { WebhookService } from './webhook.service';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhookController {
  constructor(private webhookService: WebhookService) {}

  @Post(':provider')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Receive delivery events from a mail provider' })
  @ApiParam({ name: 'provider', description: 'Mail provider name (e.g. brevo, custom_smtp)' })
  async handle(@Param('provider') provider: string, @Req() req: Request, @Body() body: unknown) {
    this.webhookService.verifySignature(req, provider);
    const result = await this.webhookService.handleEvent(provider, body);
    return { ...result, received: true };
  }
}
