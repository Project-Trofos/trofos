import React from 'react';
import { Typography, Row, Col } from 'antd';

import ProjectCard from '../components/cards/ProjectCard';
import ProjectCreationModal from '../components/modals/ProjectCreationModal';
import { useGetAllProjectsQuery } from '../api';


const { Title, Paragraph } = Typography;

export default function ProjectsPage(): JSX.Element {
  const { data: projects, isLoading } = useGetAllProjectsQuery();

  if (isLoading) {
    return (
      <main style={{ margin: '48px' }}>
        Loading...
      </main>
    );
  }
  
  if (projects === undefined || projects.length === 0) {
    return (
      <main style={{ margin: '48px' }}>
        <Title>Projects</Title>
        <Paragraph>It seems that you do not have a project yet...</Paragraph>
        <ProjectCreationModal />
      </main>
    );
  }

  return (
    <main style={{ margin: '48px' }}>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem', alignItems: 'center' }}>
        <Title>Projects</Title>
        <ProjectCreationModal />
      </div>

      <Row gutter={[16, 16]} wrap>
        {projects.map((project) => (
          <Col key={project.id}>
            <ProjectCard project={project} />
          </Col>
        ))}
      </Row>
    </main>
  );
}
