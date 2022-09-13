import React from 'react';
import { Typography, Row, Col } from 'antd';

import CourseCreationModal from '../components/modals/CourseCreationModal';
import { useGetAllCoursesQuery } from '../api/course';
import CourseCard from '../components/cards/CourseCard';


const { Title, Paragraph } = Typography;

export default function CoursesPage(): JSX.Element {
  const { data: courses, isLoading } = useGetAllCoursesQuery();

  if (isLoading) {
    return (
      <main style={{ margin: '48px' }}>
        Loading...
      </main>
    );
  }
  
  if (courses === undefined || courses.length === 0) {
    return (
      <main style={{ margin: '48px' }}>
        <Title>Courses</Title>
        <Paragraph>It seems that you do not have a course yet...</Paragraph>
        <CourseCreationModal />
      </main>
    );
  }

  return (
    <main style={{ margin: '48px' }}>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem', alignItems: 'center' }}>
        <Title>Courses</Title>
        <CourseCreationModal />
      </div>

      <Row gutter={[16, 16]} wrap>
        {courses.map((course) => (
          <Col key={course.id}>
            <CourseCard course={course} />
          </Col>
        ))}
      </Row>
    </main>
  );
}
