import React from 'react';
import { Button, Space, Spin, Typography } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useGetUserInfoQuery } from '../api/auth';
import FacultyDashboard from './FacultyDashboard';
import conditionalRender from '../helpers/conditionalRender';
import { UserPermissionActions } from '../helpers/constants';
import UserDashboard from './UserDashboard';

const { Title } = Typography;

export default function HomePage(): JSX.Element {
  const { data: userInfo, isLoading } = useGetUserInfoQuery();

  if (isLoading) {
    return <Spin />;
  }

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

  return conditionalRender(
    <FacultyDashboard userInfo={userInfo} />,
    userInfo.userRoleActions,
    [UserPermissionActions.CREATE_COURSE, UserPermissionActions.ADMIN],
    <UserDashboard userInfo={userInfo} />,
  );
}
