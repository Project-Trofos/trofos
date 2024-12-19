import React from 'react';
import { Typography } from 'antd';

import ProjectCreationModal from '../../components/modals/ProjectCreationModal';
import Container from '../../components/layouts/Container';
import { useGetUserInfoQuery } from '../../api/auth';
import conditionalRender from '../../helpers/conditionalRender';
import { UserPermissionActions } from '../../helpers/constants';
import { Outlet } from 'react-router-dom';
import PageHeader from '../../components/pageheader/PageHeader';

const { Title } = Typography;

export default function ProjectsPage(): JSX.Element {
  const { data: userInfo } = useGetUserInfoQuery();

  const headerButtons = [conditionalRender(<ProjectCreationModal />, userInfo?.userRoleActions ?? [], [
    UserPermissionActions.ADMIN,
    UserPermissionActions.CREATE_PROJECT,
  ])];

  return (
    <Container fullWidth noGap>
      <PageHeader
        title="Projects"
        buttons={headerButtons}
      />
      <Outlet />
    </Container>
  );
}
