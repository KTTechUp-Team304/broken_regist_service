import { AdminCourseEdit } from '@/components/admin/admin-course-edit';

interface Props {
  params: { courseId: string };
}

export default function AdminCourseEditPage({ params }: Props) {
  return <AdminCourseEdit courseId={params.courseId} />;
}
