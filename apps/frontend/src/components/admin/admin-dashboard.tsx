'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Users, BookOpen, TrendingUp, Activity } from 'lucide-react';
import { fetchAdminDashboard } from '@/commons/api/admin-api';
import styles from './admin-dashboard.module.css';

const COLORS = ['#c62917', '#e74c3c', '#f39c12', '#3498db', '#95a5a6'];

function formatStatValue(value: number) {
  return value.toLocaleString('ko-KR');
}

export function AdminDashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: fetchAdminDashboard,
  });

  if (isLoading) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>관리자 대시보드</h1>
        <p>데이터를 불러오는 중…</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>관리자 대시보드</h1>
        <p>대시보드 데이터를 불러오지 못했습니다.</p>
      </div>
    );
  }

  const { stats, enrollmentTrend, courseDistribution, weeklyActiveUsers } = data;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>관리자 대시보드</h1>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Users size={24} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>전체 사용자</span>
            <span className={styles.statValue}>{formatStatValue(stats.totalUsers.value)}</span>
            <span className={styles.statChange}>{stats.totalUsers.change}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <BookOpen size={24} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>개설 강의</span>
            <span className={styles.statValue}>{formatStatValue(stats.openedCourses.value)}</span>
            <span className={styles.statChange}>{stats.openedCourses.change}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <TrendingUp size={24} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>총 수강신청</span>
            <span className={styles.statValue}>{formatStatValue(stats.totalEnrollments.value)}</span>
            <span className={styles.statChange}>{stats.totalEnrollments.change}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Activity size={24} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>활성 사용자</span>
            <span className={styles.statValue}>{formatStatValue(stats.activeUsers.value)}</span>
            <span className={styles.statChange}>{stats.activeUsers.change}</span>
          </div>
        </div>
      </div>

      <div className={styles.quickActions}>
        <Link href="/admin/courses" className={styles.actionCard}>
          <BookOpen size={32} />
          <h3>강의 관리</h3>
          <p>강의 생성, 수정 및 삭제</p>
        </Link>
        <Link href="/admin/users" className={styles.actionCard}>
          <Users size={32} />
          <h3>사용자 관리</h3>
          <p>사용자 권한 및 상태 관리</p>
        </Link>
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>월별 수강신청 추이</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={enrollmentTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3a" />
              <XAxis dataKey="month" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip
                contentStyle={{ background: '#2a2a2a', border: '1px solid #3a3a3a', borderRadius: '3px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#c62917" strokeWidth={2} name="수강신청 수" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>분야별 강의 분포</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={courseDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {courseDistribution.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#2a2a2a', border: '1px solid #3a3a3a', borderRadius: '3px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>주간 활성 사용자</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyActiveUsers}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3a" />
              <XAxis dataKey="day" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip
                contentStyle={{ background: '#2a2a2a', border: '1px solid #3a3a3a', borderRadius: '3px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Bar dataKey="users" fill="#c62917" name="활성 사용자" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
