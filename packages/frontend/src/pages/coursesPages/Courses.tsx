import React, { useMemo } from 'react';
import { Typography, Space } from 'antd';

import CourseCreationModal from '../../components/modals/CourseCreationModal';

import Container from '../../components/layouts/Container';
import { useGetUserInfoQuery } from '../../api/auth';
import conditionalRender from '../../helpers/conditionalRender';
import { UserPermissionActions } from '../../helpers/constants';
import { Outlet } from 'react-router-dom';
import PageTitle from '../../components/pageheader/PageTitle';

const { Title } = Typography;

export default function CoursesPage(): JSX.Element {
  const { data: userInfo } = useGetUserInfoQuery();

  const headerButtons = [conditionalRender(<CourseCreationModal />, userInfo?.userRoleActions ?? [], [
    UserPermissionActions.ADMIN,
    UserPermissionActions.CREATE_COURSE,
  ])];

  return (
    <Container fullWidth noGap>
      <PageTitle
          title="Courses"
          buttons={headerButtons}
        />
      <Outlet />
    </Container>
  );
}
