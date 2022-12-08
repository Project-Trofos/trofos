import React from 'react';
import { Typography, Row, Col, Space, Tabs } from 'antd';

import CourseCreationModal from '../components/modals/CourseCreationModal';
import { useCurrentAndPastCourses } from '../api/hooks';
import CourseCard from '../components/cards/CourseCard';

import './Courses.css';
import Container from '../components/layouts/Container';
import { Course } from '../api/types';

const { Title } = Typography;

export default function CoursesPage(): JSX.Element {
  const { currentCourses, pastCourses, futureCourses, isLoading } = useCurrentAndPastCourses();

  if (isLoading) {
    return <main style={{ margin: '48px' }}>Loading...</main>;
  }

  return (
    <Container>
      <Space style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
        <Title style={{ margin: 0 }}>Courses</Title>
        <CourseCreationModal />
      </Space>
      <Tabs>
        {renderCoursesPane(currentCourses, 'Current Courses', 'There are no current courses.')}
        {renderCoursesPane(pastCourses, 'Past Courses', 'There are no past courses.')}
        {renderCoursesPane(futureCourses, 'Future Courses', 'There are no future courses.')}
      </Tabs>
    </Container>
  );
}

function renderCoursesPane(courses: Course[] | undefined, tabName: string, emptyPrompt: string) {
  return (
    <Tabs.TabPane tab={tabName} key={tabName}>
      {!courses || courses.length === 0 ? (
        emptyPrompt
      ) : (
        <Row gutter={[16, 16]} wrap>
          {courses.map((course) => (
            <Col key={course.id}>
              <CourseCard course={course} />
            </Col>
          ))}
        </Row>
      )}
    </Tabs.TabPane>
  );
}
