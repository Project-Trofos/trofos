import React, { useMemo } from 'react';
import { Typography, Space, Tabs, Spin } from 'antd';

import CourseCreationModal from '../components/modals/CourseCreationModal';
import { useCurrentAndPastCourses } from '../api/hooks';

import Container from '../components/layouts/Container';
import getPane from '../helpers/getPane';

const { Title } = Typography;

export default function CoursesPage(): JSX.Element {
  const { currentCourses, pastCourses, futureCourses, isLoading } = useCurrentAndPastCourses();

  const currentCoursesTabPane = useMemo(
    () => getPane(currentCourses, 'Current Courses', 'There are no current courses.'),
    [currentCourses],
  );

  const pastCoursesTabPane = useMemo(
    () => getPane(pastCourses, 'Past Courses', 'There are no past courses.'),
    [pastCourses],
  );

  const futureCoursesTabPane = useMemo(
    () => getPane(futureCourses, 'Future Courses', 'There are no future courses.'),
    [futureCourses],
  );

  if (isLoading) {
    return <Spin />;
  }

  return (
    <Container fullWidth noGap>
      <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Title>Courses</Title>
        <CourseCreationModal />
      </Space>
      <Tabs items={[currentCoursesTabPane, pastCoursesTabPane, futureCoursesTabPane]} />
    </Container>
  );
}
