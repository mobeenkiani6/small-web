import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { SitesService } from './sites.service';
import { PublishSiteDto } from './dto';

@Controller('sites')
export class SitesController {
  constructor(private readonly sites: SitesService) {}

  @Get()
  list() {
    return this.sites.list();
  }

  @Get('resolve')
  resolve(@Query('address') address: string) {
    return this.sites.resolve(address ?? '');
  }

  @Get(':address')
  async one(@Param('address') address: string) {
    return this.sites.resolve(address);
  }

  @Post()
  publish(@Body() dto: PublishSiteDto) {
    return this.sites.publish(dto);
  }
}
