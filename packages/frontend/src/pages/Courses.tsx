import React from 'react';
import { Typography, Row, Col, Space, Tabs } from 'antd';

import CourseCreationModal from '../components/modals/CourseCreationModal';
import { useCurrentAndPastCourses } from '../api/course';
import CourseCard from '../components/cards/CourseCard';

import './Courses.css';

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
    <main style={{ padding: '48px' }}>
      <Space style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
        <Title style={{ margin: 0 }}>Courses</Title>
        <CourseCreationModal />
      </Space>
      <Tabs>
        <Tabs.TabPane tab="Current Courses" key="current-courses">
          {currentCourses.length === 0 ? (
            'There are no current courses'
          ) : (
            <Row gutter={[16, 16]} wrap>
              {currentCourses.map((course) => (
                <Col key={`${course.year}-${course.sem}-${course.id}`}>
                  <CourseCard course={course} />
                </Col>
              ))}
            </Row>
          )}
        </Tabs.TabPane>
        <Tabs.TabPane tab="Past Courses" key="past-courses">
          {pastCourses.length === 0 ? (
            'There are no past courses'
          ) : (
            <Row gutter={[16, 16]} wrap>
              {pastCourses.map((course) => (
                <Col key={`${course.year}-${course.sem}-${course.id}`}>
                  <CourseCard course={course} />
                </Col>
              ))}
            </Row>
          )}
        </Tabs.TabPane>
      </Tabs>
    </main>
  );
}
