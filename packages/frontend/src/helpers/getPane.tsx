import React from 'react';
import { Row, Col, Typography, Empty } from 'antd';
import CourseCard from '../components/cards/CourseCard';
import { Course, Project } from '../api/types';
import ProjectCard from '../components/cards/ProjectCard';

// Get a pane item with children of either course cards, project cards or empty message prompt
export default function getPane(items: Project[] | Course[] | undefined, emptyPrompt: string): JSX.Element {
  return !items || items.length === 0 ? (
    <Empty
      description={
        <Typography>{emptyPrompt}</Typography>
      }
    />
  ) : (
    <Row gutter={[16, 16]} wrap>
      {items.map((item) =>
        'pname' in item ? (
          <Col key={item.id}>
            <ProjectCard project={item} />
          </Col>
        ) : (
          <Col key={item.id}>
            <CourseCard course={item} />
          </Col>
        ),
      )}
    </Row>
  );
}
