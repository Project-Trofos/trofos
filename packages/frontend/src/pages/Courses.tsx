import React from 'react';
import { Typography, Row, Col, Space, Tabs } from 'antd';

import CourseCreationModal from '../components/modals/CourseCreationModal';
import { useCurrentAndPastCourses } from '../api/hooks';
import CourseCard from '../components/cards/CourseCard';

import Container from '../components/layouts/Container';

const { Title, Paragraph } = Typography;

export default function CoursesPage(): JSX.Element {
  const { data: courses, currentCourses, pastCourses, isLoading } = useCurrentAndPastCourses();

  if (isLoading) {
    return <main style={{ margin: '48px' }}>Loading...</main>;
  }

  if (!currentCourses || !pastCourses || !courses || courses.length === 0) {
    return (
      <main style={{ margin: '48px' }}>
        <Title>Courses</Title>
        <Paragraph>It seems that you do not have a course yet...</Paragraph>
        <CourseCreationModal />
      </main>
    );
  }

  return (
    <Container>
      <Space style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
        <Title style={{ margin: 0 }}>Courses</Title>
        <CourseCreationModal />
      </Space>
      <Tabs
        items={[
          {
            label: 'Current Courses',
            key: 'current-courses',
            children:
              currentCourses.length === 0 ? (
                <p>There are no current courses</p>
              ) : (
                <Row gutter={[16, 16]} wrap>
                  {currentCourses.map((course) => (
                    <Col key={`${course.year}-${course.sem}-${course.id}`}>
                      <CourseCard course={course} />
                    </Col>
                  ))}
                </Row>
              ),
          },
          {
            label: 'Past Courses',
            key: 'past-courses',
            children:
              pastCourses.length === 0 ? (
                'There are no past courses'
              ) : (
                <Row gutter={[16, 16]} wrap>
                  {pastCourses.map((course) => (
                    <Col key={`${course.year}-${course.sem}-${course.id}`}>
                      <CourseCard course={course} />
                    </Col>
                  ))}
                </Row>
              ),
          },
        ]}
      />
    </Container>
  );
}
