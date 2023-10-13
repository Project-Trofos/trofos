import React, { useMemo } from 'react';
import { Typography, Space } from 'antd';

import ProjectCreationModal from '../../components/modals/ProjectCreationModal';
import Container from '../../components/layouts/Container';
import { useGetUserInfoQuery } from '../../api/auth';
import conditionalRender from '../../helpers/conditionalRender';
import { UserPermissionActions } from '../../helpers/constants';
import { Outlet } from 'react-router-dom';

const { Title } = Typography;

export default function ProjectsPage(): JSX.Element {
  const { data: userInfo } = useGetUserInfoQuery();

  return (
    <Container fullWidth noGap>
      <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Title>Projects</Title>
        {conditionalRender(<ProjectCreationModal />, userInfo?.userRoleActions ?? [], [
          UserPermissionActions.ADMIN,
          UserPermissionActions.CREATE_PROJECT,
        ])}
      </Space>
      <Outlet />
    </Container>
  );
}
