import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';


@ApiTags('Health')
@Controller()
export class AppController {
  @Get()
  health() {
    return {
      name: process.env.npm_package_name,
      version: process.env.npm_package_version,
      nodeVersion: process.version,
    };
  }
}
