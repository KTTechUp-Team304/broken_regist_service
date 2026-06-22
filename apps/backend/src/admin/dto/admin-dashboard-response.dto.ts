import { ApiProperty } from '@nestjs/swagger';

class StatItemDto {
  @ApiProperty({ example: 1234 })
  value: number;

  @ApiProperty({ example: '+12% from last month' })
  change: string;
}

class DashboardStatsDto {
  @ApiProperty({ type: StatItemDto })
  totalUsers: StatItemDto;

  @ApiProperty({ type: StatItemDto })
  openedCourses: StatItemDto;

  @ApiProperty({ type: StatItemDto })
  totalEnrollments: StatItemDto;

  @ApiProperty({ type: StatItemDto })
  activeUsers: StatItemDto;
}

class EnrollmentTrendItemDto {
  @ApiProperty({ example: '1월' })
  month: string;

  @ApiProperty({ example: 45 })
  count: number;
}

class CourseDistributionItemDto {
  @ApiProperty({ example: '컴퓨터공학' })
  name: string;

  @ApiProperty({ example: 35 })
  value: number;
}

class WeeklyActiveUserItemDto {
  @ApiProperty({ example: '월' })
  day: string;

  @ApiProperty({ example: 120 })
  users: number;
}

export class AdminDashboardResponseDto {
  @ApiProperty({ type: DashboardStatsDto })
  stats: DashboardStatsDto;

  @ApiProperty({ type: [EnrollmentTrendItemDto] })
  enrollmentTrend: EnrollmentTrendItemDto[];

  @ApiProperty({ type: [CourseDistributionItemDto] })
  courseDistribution: CourseDistributionItemDto[];

  @ApiProperty({ type: [WeeklyActiveUserItemDto] })
  weeklyActiveUsers: WeeklyActiveUserItemDto[];
}
