import React, { useMemo } from 'react';
import { Typography, Row, Col, Space, Tabs } from 'antd';

import CourseCreationModal from '../components/modals/CourseCreationModal';
import { useCurrentAndPastCourses } from '../api/hooks';
import CourseCard from '../components/cards/CourseCard';

import Container from '../components/layouts/Container';
import { Course } from '../api/types';

const { Title } = Typography;

export default function CoursesPage(): JSX.Element {
  const { currentCourses, pastCourses, futureCourses, isLoading } = useCurrentAndPastCourses();

  const currentCoursesTabPane = useMemo(
    () => getCoursesPane(currentCourses, 'Current Projects', 'There are no current projects.'),
    [currentCourses],
  );

  const pastCoursesTabPane = useMemo(
    () => getCoursesPane(pastCourses, 'Past Projects', 'There are no past projects.'),
    [pastCourses],
  );

  const futureCoursesTabPane = useMemo(
    () => getCoursesPane(futureCourses, 'Future Projects', 'There are no future projects.'),
    [futureCourses],
  );

  if (isLoading) {
    return <main style={{ margin: '48px' }}>Loading...</main>;
  }

  return (
    <Container>
      <Space style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
        <Title>Courses</Title>
        <CourseCreationModal />
      </Space>
      <Tabs items={[currentCoursesTabPane, pastCoursesTabPane, futureCoursesTabPane]} />
    </Container>
  );
}

function getCoursesPane(
  courses: Course[] | undefined,
  tabName: string,
  emptyPrompt: string,
): NonNullable<React.ComponentProps<typeof Tabs>['items']>[number] {
  return {
    label: tabName,
    key: tabName,
    children:
      !courses || courses.length === 0 ? (
        emptyPrompt
      ) : (
        <Row gutter={[16, 16]} wrap>
          {courses.map((course) => (
            <Col key={course.id}>
              <CourseCard course={course} />
            </Col>
          ))}
        </Row>
      ),
  };
}
