import React, { useMemo } from 'react';
import { Typography, Row, Col, Tabs, Space } from 'antd';

import ProjectCard from '../components/cards/ProjectCard';
import ProjectCreationModal from '../components/modals/ProjectCreationModal';
import { useCurrentAndPastProjects } from '../api/hooks';
import Container from '../components/layouts/Container';
import { Project } from '../api/types';

const { Title } = Typography;

export default function ProjectsPage(): JSX.Element {
  const { currentProjects, pastProjects, futureProjects, isLoading } = useCurrentAndPastProjects();

  const currentProjectTabPane = useMemo(
    () => getProjectsPane(currentProjects, 'Current Projects', 'There are no current projects.'),
    [currentProjects],
  );

  const pastProjectTabPane = useMemo(
    () => getProjectsPane(pastProjects, 'Past Projects', 'There are no past projects.'),
    [pastProjects],
  );

  const futureProjectTabPane = useMemo(
    () => getProjectsPane(futureProjects, 'Future Projects', 'There are no future projects.'),
    [futureProjects],
  );

  if (isLoading) {
    return <main style={{ margin: '48px' }}>Loading...</main>;
  }

  return (
    <Container>
      <Space style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
        <Title>Projects</Title>
        <ProjectCreationModal />
      </Space>

      <Tabs items={[currentProjectTabPane, pastProjectTabPane, futureProjectTabPane]} />
    </Container>
  );
}

function getProjectsPane(
  projects: Project[] | undefined,
  tabName: string,
  emptyPrompt: string,
): NonNullable<React.ComponentProps<typeof Tabs>['items']>[number] {
  return {
    label: tabName,
    key: tabName,
    children:
      !projects || projects.length === 0 ? (
        emptyPrompt
      ) : (
        <Row gutter={[16, 16]} wrap>
          {projects.map((project) => (
            <Col key={project.id}>
              <ProjectCard project={project} />
            </Col>
          ))}
        </Row>
      ),
  };
}
