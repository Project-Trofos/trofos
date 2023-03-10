import React, { useMemo } from 'react';
import { Typography, Tabs, Space, Spin } from 'antd';

import ProjectCreationModal from '../components/modals/ProjectCreationModal';
import { useCurrentAndPastProjects } from '../api/hooks';
import Container from '../components/layouts/Container';
import getPane from '../helpers/getPane';
import { useGetUserInfoQuery } from '../api/auth';
import conditionalRender from '../helpers/conditionalRender';
import { UserPermissionActions } from '../helpers/constants';

const { Title } = Typography;

export default function ProjectsPage(): JSX.Element {
  const { currentProjects, pastProjects, futureProjects, isLoading } = useCurrentAndPastProjects();

  const { data: userInfo } = useGetUserInfoQuery();

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
    return <Spin />;
  }

  return (
    <Container fullWidth noGap>
      <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Title>Projects</Title>
        {conditionalRender(<ProjectCreationModal />, userInfo?.userRoleActions ?? [], [
          UserPermissionActions.ADMIN,
          UserPermissionActions.CREATE_PROJECT,
        ])}
      </Space>
      <Tabs items={[currentProjectTabPane, pastProjectTabPane, futureProjectTabPane]} />
    </Container>
  );
}
