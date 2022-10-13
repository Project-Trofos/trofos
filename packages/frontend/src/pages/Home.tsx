import React from 'react';
import { Typography } from 'antd';
import { useGetUserInfoQuery, UserRole } from '../api/auth';
import ProjectsPage from './Projects';
import FacultyDashboard from './FacultyDashboard';

const { Title } = Typography;

export default function HomePage(): JSX.Element {
  const { data: userInfo } = useGetUserInfoQuery();

  // User is not logged in
  if (!userInfo) {
    return (
      <main style={{ margin: '48px' }}>
        <Title>Please Log In</Title>
      </main>
    );
  }

  if (userInfo.userRole === UserRole.FACULTY) {
    return <FacultyDashboard userInfo={userInfo} />;
  }
  if (userInfo.userRole === UserRole.STUDENT) {
    return <ProjectsPage />;
  }

  return <div />;
}
