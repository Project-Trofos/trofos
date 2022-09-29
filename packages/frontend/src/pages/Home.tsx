import React from 'react';
import { Typography } from 'antd';
import { useGetUserInfoQuery } from '../api/auth';
import ProjectsPage from './Projects';

const { Title } = Typography;

export default function HomePage(): JSX.Element {

  const { data: userInfo } = useGetUserInfoQuery();
  
  return userInfo 
    ? <ProjectsPage /> 
    : <main style={{ margin: '48px' }}>
        <Title>Please Log In</Title>
      </main>
}
