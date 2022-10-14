import React from 'react';
import { Button, Space, Typography } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useGetUserInfoQuery, UserRole } from '../api/auth';
import ProjectsPage from './Projects';
import FacultyDashboard from './FacultyDashboard';

const { Title } = Typography;

export default function HomePage(): JSX.Element {
  const { data: userInfo } = useGetUserInfoQuery();

  // User is not logged in
  if (!userInfo) {
    return (
      <Space size="middle" className='main-content-container centralize-content'>
        <ExclamationCircleOutlined style={{fontSize: 96, color: '#EFC050'}} />
        <Title style={{textAlign: "center", margin: 0}}>Please Log In</Title>
        <Link to="/login">
          <Button type="primary">Login</Button>
        </Link>
      </Space>
    );
  }

  // Only show faculty dashboard to faculty
  if (userInfo.userRole === UserRole.FACULTY) {
    return <FacultyDashboard userInfo={userInfo} />;
  }

  // Default to projects page
  return <ProjectsPage />;
}
