import { Injectable } from '@nestjs/common';
import { CTF_FLAGS } from '../flags/ctf-flags.constants';

@Injectable()
export class AdminService {
  /**
   * GET /api/admin — 관리자 대시보드용 하드코딩 통계
   */
  getDashboard() {
    return {
      stats: {
        totalUsers: {
          value: 1234,
          change: '+12% from last month',
        },
        openedCourses: {
          value: 87,
          change: '+5 new courses',
        },
        totalEnrollments: {
          value: 3456,
          change: '+8% this week',
        },
        activeUsers: {
          value: 892,
          change: 'Last 7 days',
        },
      },
      enrollmentTrend: [
        { month: '1월', count: 45 },
        { month: '2월', count: 52 },
        { month: '3월', count: 78 },
        { month: '4월', count: 95 },
        { month: '5월', count: 68 },
      ],
      courseDistribution: [
        { name: '컴퓨터공학', value: 35 },
        { name: '보안', value: 25 },
        { name: '인공지능', value: 20 },
        { name: '데이터분석', value: 15 },
        { name: '기타', value: 5 },
      ],
      weeklyActiveUsers: [
        { day: '월', users: 120 },
        { day: '화', users: 145 },
        { day: '수', users: 132 },
        { day: '목', users: 158 },
        { day: '금', users: 142 },
        { day: '토', users: 85 },
        { day: '일', users: 65 },
      ],
      _debug_trace: { access_level: 'admin', auth_guard: false, flag: CTF_FLAGS.BFLA_ADMIN_DASH },
    };
  }
}
