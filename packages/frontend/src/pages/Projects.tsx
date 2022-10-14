import React from 'react';
import { Typography, Row, Col, Tabs, Space } from 'antd';

import ProjectCard from '../components/cards/ProjectCard';
import ProjectCreationModal from '../components/modals/ProjectCreationModal';
import { useCurrentAndPastProjects } from '../api/hooks';
import Container from '../components/layouts/Container';

const { Title, Paragraph } = Typography;

export default function ProjectsPage(): JSX.Element {
  const { data: projects, currentProjects, pastProjects, isLoading } = useCurrentAndPastProjects();

  if (isLoading) {
    return <main style={{ margin: '48px' }}>Loading...</main>;
  }

  if (!currentProjects || !pastProjects || projects === undefined || projects.length === 0) {
    return (
      <main style={{ margin: '48px' }}>
        <Title>Projects</Title>
        <Paragraph>It seems that you do not have a project yet...</Paragraph>
        <ProjectCreationModal />
      </main>
    );
  }

  return (
    <Container>
      <Space style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
        <Title>Projects</Title>
        <ProjectCreationModal />
      </Space>

      <Tabs>
        <Tabs.TabPane tab="Current Projects" key="current-courses">
          {currentProjects.length === 0 ? (
            'There are no current projects'
          ) : (
            <Row gutter={[16, 16]} wrap>
              {currentProjects.map((project) => (
                <Col key={project.id}>
                  <ProjectCard project={project} />
                </Col>
              ))}
            </Row>
          )}
        </Tabs.TabPane>
        <Tabs.TabPane tab="Past Projects" key="past-courses">
          {pastProjects.length === 0 ? (
            'There are no past projects'
          ) : (
            <Row gutter={[16, 16]} wrap>
              {pastProjects.map((project) => (
                <Col key={project.id}>
                  <ProjectCard project={project} />
                </Col>
              ))}
            </Row>
          )}
        </Tabs.TabPane>
      </Tabs>
    </Container>
  );
}
