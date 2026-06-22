import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseFilesController, FilesController } from './files.controller';
import { FilesService } from './files.service';
import { FileResource } from './entities/file.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FileResource])],
  controllers: [CourseFilesController, FilesController],
  providers: [FilesService],
})
export class FilesModule {}
