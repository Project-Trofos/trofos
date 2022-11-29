import React, { useMemo, useState } from 'react';
import { Space, Switch, Typography } from 'antd';
import { UserInfo } from '../api/auth';

import ProjectTable from '../components/tables/ProjectTable';
import { useCurrentAndPastCourses, useCurrentAndPastProjects } from '../api/hooks';
import Container from '../components/layouts/Container';
import { Heading } from '../components/typography';
import CourseTable from '../components/tables/CourseTable';

const { Title } = Typography;

export default function FacultyDashboard({ userInfo }: { userInfo: UserInfo }): JSX.Element {
  const [isPastProject, setIsPastProject] = useState(false);
  const [isPastCourse, setIsPastCourse] = useState(false);
  const { currentProjects, pastProjects, isLoading: isProjectLoading } = useCurrentAndPastProjects();
  const { currentCourses, pastCourses, isLoading: isCourseLoading } = useCurrentAndPastCourses();

  const projectControl = useMemo(
    () => (
      <Space>
        <Typography.Text>Toggle Past Projects</Typography.Text>
        <Switch onChange={(isOn) => setIsPastProject(isOn)} />
      </Space>
    ),
    [setIsPastProject],
  );

  const courseControl = useMemo(
    () => (
      <Space>
        <Typography.Text>Toggle Past Courses</Typography.Text>
        <Switch onChange={(isOn) => setIsPastCourse(isOn)} />
      </Space>
    ),
    [setIsPastCourse],
  );

  return (
    <Container>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Heading style={{ margin: 0 }}>Home</Heading>
        <WelcomeMessage username={userInfo.userEmail} />
        <CourseTable
          courses={isPastCourse ? pastCourses : currentCourses}
          isLoading={isCourseLoading}
          heading={isPastCourse ? 'Past Course' : 'Current Course'}
          control={courseControl}
        />
        <ProjectTable
          projects={isPastProject ? pastProjects : currentProjects}
          isLoading={isProjectLoading}
          heading={isPastProject ? 'Past Projects' : 'Current Projects'}
          control={projectControl}
          showCourseColumn
        />
      </Space>
    </Container>
  );
}

function WelcomeMessage({ username }: { username: string }) {
  return (
    <Title style={{ margin: 0 }} level={5}>
      Welcome, {username}!
    </Title>
  );
}
