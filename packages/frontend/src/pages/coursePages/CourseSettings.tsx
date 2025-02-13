import React from 'react';
import { Layout, Tabs, theme } from 'antd';
import GenericBoxWithBackground from '../../components/layouts/GenericBoxWithBackground';
import CourseDetails from './CourseDetails';
import Container from '../../components/layouts/Container';
import CourseProjectAssignments from './CourseProjectAssignments';

export default function CourseSettings(): JSX.Element {
  const { token } = theme.useToken();

  return (
    <GenericBoxWithBackground>
      <Tabs
        items={[
          { key: 'course-details', label: 'Course Details', children: <CourseDetails /> },
          { key: 'project-assignment', label: 'Project Assignments', children: <CourseProjectAssignments /> },
        ]}
        centered
        style={{
          width: '100%',
          marginBottom: 8,
          padding: 16,
          backgroundColor: token.colorBgContainer,
          borderRadius: token.borderRadiusLG,
        }}
      />
    </GenericBoxWithBackground>
  );
}
