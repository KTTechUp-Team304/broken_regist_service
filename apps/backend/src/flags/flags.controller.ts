import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SubmitFlagDto } from './dto/submit-flag.dto';
import { FlagsService } from './flags.service';

@ApiTags('ctf-flags')
@Controller('flags')
export class FlagsController {
  constructor(private readonly flagsService: FlagsService) {}

  @Get()
  getAll() {
    return this.flagsService.getAll();
  }

  @Post('submit')
  submit(@Body() dto: SubmitFlagDto) {
    return this.flagsService.submit(dto);
  }
}
