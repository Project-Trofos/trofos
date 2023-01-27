import React, { useMemo } from 'react';
import { Typography, Tabs, Space } from 'antd';

import ProjectCreationModal from '../components/modals/ProjectCreationModal';
import { useCurrentAndPastProjects } from '../api/hooks';
import Container from '../components/layouts/Container';
import getPane from '../helpers/getPane';

const { Title } = Typography;

export default function ProjectsPage(): JSX.Element {
  const { currentProjects, pastProjects, futureProjects, isLoading } = useCurrentAndPastProjects();

  const currentProjectTabPane = useMemo(
    () => getPane(currentProjects, 'Current Projects', 'There are no current projects.'),
    [currentProjects],
  );

  const pastProjectTabPane = useMemo(
    () => getPane(pastProjects, 'Past Projects', 'There are no past projects.'),
    [pastProjects],
  );

  const futureProjectTabPane = useMemo(
    () => getPane(futureProjects, 'Future Projects', 'There are no future projects.'),
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
