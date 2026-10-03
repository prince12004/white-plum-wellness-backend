import { Controller, Get } from '@nestjs/common';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @RequirePermissions('analytics:read')
  getOverview() {
    return this.analyticsService.getOverview();
  }
}
