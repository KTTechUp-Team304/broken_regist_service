import { Courses } from '../../../components/courses/courses';

type CoursesPageProps = {
  searchParams: {
    isVisible?: string;
    isvisible?: string;
  };
};

export default function CoursesPage({ searchParams }: CoursesPageProps) {
  const isVisibleQuery =
    searchParams.isVisible ?? searchParams.isvisible ?? undefined;

  return <Courses isVisibleQuery={isVisibleQuery} />;
}
