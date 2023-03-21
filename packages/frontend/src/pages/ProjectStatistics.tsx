import React, { useMemo, useState } from 'react';
import { skipToken } from '@reduxjs/toolkit/dist/query/react';
import { useParams } from 'react-router-dom';
import { Card, Col, Divider, Empty, Row, Segmented, Select, Space, Statistic, Switch } from 'antd';
import dayjs from 'dayjs';
import { useCourse, useProject } from '../api/hooks';
import { useGetSprintsByProjectIdQuery } from '../api/sprint';
import Container from '../components/layouts/Container';
import { useGetProjectBacklogHistoryQuery } from '../api/backlog';
import { BurnDownChart } from '../components/visualization/BurnDownChart';
import { Heading, Subheading } from '../components/typography';
import BacklogTable from '../components/tables/BacklogTable';
import UserBacklogPieChart from '../components/visualization/UserBacklogPieChart';
import VelocityGraph from '../components/visualization/VelocityGraph';

export default function ProjectStatistics(): JSX.Element {
  const params = useParams();
  const { project } = useProject(Number(params.projectId));
  const { data: sprintsData } = useGetSprintsByProjectIdQuery(project?.id ?? skipToken);
  const { data: backlogHistory } = useGetProjectBacklogHistoryQuery(
    project?.id ? { projectId: project.id } : skipToken,
  );

  const [selectedUser, setSelectedUser] = useState<{ id: number; displayName: string }>();
  const [sprintId, setSprintId] = useState<number>();
  const [segment, setSegment] = useState<'Overall' | 'By Sprint'>('Overall');

  const selectedSprint = useMemo(() => {
    return sprintsData?.sprints.find((s) => s.id === sprintId);
  }, [sprintsData, sprintId]);

  const selectedUserHistory = useMemo(() => {
    if (!backlogHistory || !selectedSprint) {
      return [];
    }
    return backlogHistory.filter((b) => b.assignee_id === selectedUser?.id && b.sprint_id === selectedSprint.id);
  }, [backlogHistory, selectedUser, selectedSprint]);

  const [includeIncomplete, setIncludeIncomplete] = useState<boolean>(false);

  return (
    <Container>
      <Card>
        <Space direction="vertical">
          Select and option to see contribution breakdown
          <Segmented
            options={['Overall', 'By Sprint']}
            onResize={undefined}
            onResizeCapture={undefined}
            onChange={(e) => setSegment(e as 'Overall' | 'By Sprint')}
          />
          {segment === 'By Sprint' && (
            <Space>
              <Select
                placeholder="Select sprint"
                value={selectedSprint?.id}
                options={project?.sprints.map((s) => {
                  return {
                    value: s.id,
                    label: s.name,
                  };
                })}
                onSelect={(id) => setSprintId(id)}
              />
            </Space>
          )}
        </Space>
      </Card>
      {segment === 'Overall' && sprintsData && project && (
        <>
          <Card>
            <Subheading>Sprint Velocity</Subheading>
            <VelocityGraph sprints={sprintsData.sprints} />
          </Card>
          <Card>
            <Row>
              <Col xs={24} xl={12}>
                <Subheading>Overall Contribution by Issues</Subheading>
              </Col>
              <Col xs={24} xl={12} style={{ display: 'flex', justifyContent: 'end' }}>
                <Space>
                  <div>Include Incomplete</div>
                  <Switch onChange={(e) => setIncludeIncomplete(e)} checked={includeIncomplete} />
                </Space>
              </Col>
            </Row>
            <UserBacklogPieChart
              sprints={sprintsData.sprints}
              users={project?.users}
              includeIncompleteIssues={includeIncomplete}
            />
          </Card>
          <Card>
            <BacklogTable
              heading="All Issues"
              backlogs={sprintsData.sprints.flatMap((s) => s.backlogs)}
              users={project?.users}
              projects={project ? [project] : undefined}
            />
          </Card>
        </>
      )}

      {segment === 'By Sprint' && (
        <>
          {selectedSprint && project && (
            <Card>
              <Heading>{selectedSprint.name}</Heading>
              <Row gutter={[32, 32]}>
                <Col sm={6} xs={24}>
                  <Statistic title="Start date" value={dayjs(selectedSprint.start_date).format('YYYY-MM-DD')} />
                </Col>
                <Col sm={6} xs={24}>
                  <Statistic title="End date" value={dayjs(selectedSprint.end_date).format('YYYY-MM-DD')} />
                </Col>
                <Col sm={6} xs={24}>
                  <Statistic title="Issues" value={selectedSprint.backlogs.length} />
                </Col>
                <Col sm={6} xs={24}>
                  <Statistic title="Status" value={selectedSprint.status} />
                </Col>
              </Row>
            </Card>
          )}
          {selectedSprint && project && (
            <Card>
              <Row>
                <Col xs={24} xl={12}>
                  <Subheading>Sprint Contribution by Issues</Subheading>
                </Col>
                <Col xs={24} xl={12} style={{ display: 'flex', justifyContent: 'end' }}>
                  <Space>
                    <div>Include Incomplete</div>
                    <Switch onChange={(e) => setIncludeIncomplete(e)} checked={includeIncomplete} />
                  </Space>
                </Col>
              </Row>
              <UserBacklogPieChart
                sprints={[selectedSprint]}
                users={project?.users}
                includeIncompleteIssues={includeIncomplete}
              />
            </Card>
          )}
          {selectedSprint && backlogHistory && (
            <Card>
              <BacklogTable
                control={
                  <Select
                    style={{ width: '200px' }}
                    placeholder="Select user"
                    value={selectedUser?.id}
                    options={project?.users.map((u) => {
                      return {
                        value: u.user.user_id,
                        label: u.user.user_display_name,
                      };
                    })}
                    onSelect={(_, { value, label }) => setSelectedUser({ id: value, displayName: label })}
                  />
                }
                backlogs={selectedSprint.backlogs.filter((b) => b.assignee_id === selectedUser?.id)}
                users={project?.users}
                projects={project ? [project] : undefined}
                heading="User Assigned Issues"
              />
              <Divider />
              <Subheading style={{ marginBottom: '30px' }}>User Burndown Chart</Subheading>
              {selectedUserHistory.length > 0 ? (
                <BurnDownChart backlogHistory={selectedUserHistory} sprint={selectedSprint} />
              ) : (
                <Empty />
              )}
            </Card>
          )}
        </>
      )}
    </Container>
  );
}
