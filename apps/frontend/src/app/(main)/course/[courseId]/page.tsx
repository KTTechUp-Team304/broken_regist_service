import { CourseDetail } from '../../../../components/courses/detail/detail';

type CourseDetailPageProps = {
  params: { courseId: string };
  searchParams: {
    isVisible?: string;
    isvisible?: string;
  };
};

export default function CourseDetailPage({ params, searchParams }: CourseDetailPageProps) {
  const isVisibleQuery =
    searchParams.isVisible ?? searchParams.isvisible ?? undefined;

  return (
    <CourseDetail
      courseId={Number(params.courseId)}
      isVisibleQuery={isVisibleQuery}
    />
  );
}
