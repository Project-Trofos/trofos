import React, { useMemo } from 'react';
import { Typography, Space } from 'antd';

import ProjectCreationModal from '../../components/modals/ProjectCreationModal';
import Container from '../../components/layouts/Container';
import { useGetUserInfoQuery } from '../../api/auth';
import conditionalRender from '../../helpers/conditionalRender';
import { UserPermissionActions } from '../../helpers/constants';
import { Outlet } from 'react-router-dom';
import PageTitle from '../../components/pageheader/PageTitle';

const { Title } = Typography;

export default function ProjectsPage(): JSX.Element {
  const { data: userInfo } = useGetUserInfoQuery();

  const headerButtons = [conditionalRender(<ProjectCreationModal />, userInfo?.userRoleActions ?? [], [
    UserPermissionActions.ADMIN,
    UserPermissionActions.CREATE_PROJECT,
  ])];

  return (
    <Container fullWidth noGap>
      <PageTitle
        title="Projects"
        buttons={headerButtons}
      />
      <Outlet />
    </Container>
  );
}
