import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { createTypeOrmConfig } from './config/typeorm.config';
import { CoursesModule } from './courses/courses.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { FilesModule } from './files/files.module';
import { LogsModule } from './logs/logs.module';
import { ProfessorsModule } from './professors/professors.module';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';
import { FlagsModule } from './flags/flags.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: createTypeOrmConfig,
    }),
    AuthModule,
    UsersModule,
    ProfessorsModule,
    CoursesModule,
    EnrollmentsModule,
    FilesModule,
    LogsModule,
    AdminModule,
    FlagsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
