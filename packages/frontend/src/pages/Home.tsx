import React from 'react';
import { Button, Space, Typography } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useGetUserInfoQuery } from '../api/auth';
import ProjectsPage from './Projects';
import FacultyDashboard from './FacultyDashboard';
import conditionalRender from '../helpers/conditionalRender';
import { UserPermissionActions } from '../helpers/constants';

const { Title } = Typography;

export default function HomePage(): JSX.Element {
  const { data: userInfo } = useGetUserInfoQuery();

  // User is not logged in
  if (!userInfo) {
    return (
      <Space size="middle" className="main-content-container centralize-content">
        <ExclamationCircleOutlined style={{ fontSize: 96, color: '#EFC050' }} />
        <Title style={{ textAlign: 'center', margin: 0 }}>Please Log In</Title>
        <Link to="/login">
          <Button type="primary">Login</Button>
        </Link>
      </Space>
    );
  }

  return (
    conditionalRender(<FacultyDashboard userInfo={userInfo} />, userInfo.userRoleActions, [
      UserPermissionActions.READ_COURSE,
      UserPermissionActions.ADMIN,
    ]) || <ProjectsPage />
  );
}
