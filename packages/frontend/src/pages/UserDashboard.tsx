import React, { useMemo } from 'react';
import { Card, Col, Row, Space, Statistic } from 'antd';
import { UserInfo } from '../api/auth';

import { useCurrentAndPastProjects } from '../api/hooks';
import Container from '../components/layouts/Container';
import { Subheading } from '../components/typography';
import ProjectTable from '../components/tables/ProjectTable';
import BacklogTable from '../components/tables/BacklogTable';
import { useGetBacklogsQuery } from '../api/backlog';
import { useGetAllProjectsQuery } from '../api/project';
import { Sprint, useGetSprintsQuery } from '../api/sprint';
import { Backlog } from '../api/types';
import PageHeader from '../components/pageheader/PageHeader';

export default function UserDashboard({ userInfo }: { userInfo: UserInfo }): JSX.Element {
  const { currentProjects, isLoading: isProjectLoading } = useCurrentAndPastProjects();
  const { data: backlogs, isLoading: isBacklogsLoading } = useGetBacklogsQuery();
  const { data: sprints } = useGetSprintsQuery();

  const { data: projects } = useGetAllProjectsQuery();

  const userProjectIds = useMemo(() => {
    if (!projects) {
      return [];
    }
    return projects.filter((p) => p.users.find((u) => u.user.user_id === userInfo.userId)).map((p) => p.id);
  }, [projects, userInfo]);

  const sprintsForUser = useMemo(() => {
    if (!sprints) {
      return [];
    }

    return sprints.filter((s) => userProjectIds.includes(s.project_id));
  }, [sprints, userProjectIds]);

  const backlogsForUser = useMemo(() => {
    if (!backlogs) {
      return [];
    }

    return backlogs.filter((b) => userProjectIds.includes(b.project_id));
  }, [backlogs, userProjectIds]);

  const userAssignedBacklogs = useMemo(() => {
    if (!backlogs) {
      return [];
    }

    return backlogs.filter((b) => b.assignee_id === userInfo.userId);
  }, [backlogs, userInfo]);

  return (
    <Container>
      <Space direction="vertical" style={{ width: '100%' }}>
        <PageHeader
          title="Home"
          subTitle={`Welcome, ${userInfo.userDisplayName}`}
        />
        <Row gutter={[16, 16]} itemType="flex">
          <Col xs={24} xl={12}>
            <UserDashboardStatistics
              sprintsForUser={sprintsForUser}
              userAssignedBacklogs={userAssignedBacklogs}
              backlogsForUser={backlogsForUser}
            />
          </Col>
          <Col xs={24} xl={12}>
            <Card>
              <ProjectTable
                projects={currentProjects}
                isLoading={isProjectLoading}
                heading="My Projects"
                onlyShowActions={['GOTO']}
              />
            </Card>
          </Col>
          <Col span={24}>
            <Card>
              <BacklogTable
                heading="Issues for me to do"
                removeRows={['Assignee']}
                backlogs={userAssignedBacklogs.filter((b) => b.status !== 'Done')}
                isLoading={isBacklogsLoading}
                projects={projects}
              />
            </Card>
          </Col>
          <Col span={24}>
            <Card>
              <BacklogTable
                heading="Unassigned Issues"
                removeRows={['Assignee']}
                backlogs={backlogsForUser.filter((b) => b.assignee_id === null)}
                isLoading={isBacklogsLoading}
                projects={projects}
              />
            </Card>
          </Col>
        </Row>
      </Space>
    </Container>
  );
}

function UserDashboardStatistics(props: {
  sprintsForUser: Sprint[];
  userAssignedBacklogs: Backlog[];
  backlogsForUser: Backlog[];
}) {
  const { backlogsForUser, sprintsForUser, userAssignedBacklogs } = props;
  return (
    <Card style={{ height: '100%' }}>
      <Subheading>Overview</Subheading>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Statistic title="Active Sprints" value={sprintsForUser.filter((s) => s.status === 'current').length} />
        </Col>
        <Col span={6}>
          <Statistic
            title="Outstanding Issues"
            value={userAssignedBacklogs.filter((b) => b.status !== 'Done').length}
          />
        </Col>
        <Col span={6}>
          <Statistic title="Unassigned Issues" value={backlogsForUser.filter((b) => b.assignee_id === null).length} />
        </Col>
      </Row>
    </Card>
  );
}
