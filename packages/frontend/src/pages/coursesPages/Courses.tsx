import React, { useMemo } from 'react';
import { Typography, Space } from 'antd';

import CourseCreationModal from '../../components/modals/CourseCreationModal';

import Container from '../../components/layouts/Container';
import { useGetUserInfoQuery } from '../../api/auth';
import conditionalRender from '../../helpers/conditionalRender';
import { UserPermissionActions } from '../../helpers/constants';
import { Outlet } from 'react-router-dom';

const { Title } = Typography;

export default function CoursesPage(): JSX.Element {
  const { data: userInfo } = useGetUserInfoQuery();

  return (
    <Container fullWidth noGap>
      <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Title>Courses</Title>
        {conditionalRender(<CourseCreationModal />, userInfo?.userRoleActions ?? [], [
          UserPermissionActions.ADMIN,
          UserPermissionActions.CREATE_COURSE,
        ])}
      </Space>
      <Outlet />
    </Container>
  );
}
