import React from 'react';
import { Typography, Row, Col, Tabs, Space } from 'antd';

import ProjectCard from '../components/cards/ProjectCard';
import ProjectCreationModal from '../components/modals/ProjectCreationModal';
import { useCurrentAndPastProjects } from '../api/hooks';
import Container from '../components/layouts/Container';
import { Project } from '../api/types';

const { Title } = Typography;

export default function ProjectsPage(): JSX.Element {
  const { currentProjects, pastProjects, futureProjects, isLoading } = useCurrentAndPastProjects();

  if (isLoading) {
    return <main style={{ margin: '48px' }}>Loading...</main>;
  }

  return (
    <Container>
      <Space style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
        <Title>Projects</Title>
        <ProjectCreationModal />
      </Space>

      <Tabs>
        {renderProjectsPane(currentProjects, 'Current Projects', 'There are no current projects.')}
        {renderProjectsPane(pastProjects, 'Past Projects', 'There are no past projects.')}
        {renderProjectsPane(futureProjects, 'Future Projects', 'There are no future projects.')}
      </Tabs>
    </Container>
  );
}

function renderProjectsPane(projects: Project[] | undefined, tabName: string, emptyPrompt: string) {
  return (
    <Tabs.TabPane tab={tabName} key={tabName}>
      {!projects || projects.length === 0 ? (
        emptyPrompt
      ) : (
        <Row gutter={[16, 16]} wrap>
          {projects.map((project) => (
            <Col key={project.id}>
              <ProjectCard project={project} />
            </Col>
          ))}
        </Row>
      )}
    </Tabs.TabPane>
  );
}
