import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CapturedFlag } from './entities/captured-flag.entity';
import { Flag } from './entities/flag.entity';
import { FlagsController } from './flags.controller';
import { FlagsService } from './flags.service';

@Module({
  imports: [TypeOrmModule.forFeature([Flag, CapturedFlag])],
  controllers: [FlagsController],
  providers: [FlagsService],
})
export class FlagsModule {}
