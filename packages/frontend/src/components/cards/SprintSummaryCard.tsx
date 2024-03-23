import React from 'react';
import { Card, Col, Divider, Row, Statistic } from 'antd';
import dayjs from 'dayjs';
import { Sprint } from '../../api/sprint';
import { Heading } from '../typography';
import UserBacklogPieChart from '../visualization/UserBacklogPieChart';
import DailyCompletedPointsBarGraph from '../visualization/DailyCompletedPointsBarGraph';
import { useGetProjectBacklogHistoryQuery } from '../../api/backlog';
import { useProjectIdParam } from '../../api/hooks';
import { skipToken } from '@reduxjs/toolkit/dist/query/react';
import { useGetProjectQuery } from '../../api/project';
import { BurnDownChart } from '../visualization/BurnDownChart';

type SprintSummaryCardProps = {
  sprint?: Sprint;
};

const SprintSummaryCard: React.FC<SprintSummaryCardProps> = ({ sprint }) => {
  const { data: project } = useGetProjectQuery({ id: useProjectIdParam() });
  const { data: backlogHistory } = useGetProjectBacklogHistoryQuery(
    project?.id ? { projectId: project.id } : skipToken,
  );
  return (
    sprint && (
      <Card style={{ marginBottom: '30px' }}>
        <Heading>{sprint.name} Statistics</Heading>
        <Row gutter={[32, 32]}>
          <Col sm={6} xs={24}>
            <Statistic title="Start date" value={dayjs(sprint.start_date).format('DD MMM YY')} />
          </Col>
          <Col sm={6} xs={24}>
            <Statistic title="End date" value={dayjs(sprint.end_date).format('DD MMM YY')} />
          </Col>
          <Col sm={6} xs={24}>
            <Statistic title="Issues" value={sprint.backlogs.length} />
          </Col>
          <Col sm={6} xs={24}>
            <Statistic title="Status" value={sprint.status} />
          </Col>
        </Row>
        <Divider />
        {project && (
          <Row justify="center">
            <Col xs={24} md={12}>
              <UserBacklogPieChart includeTitle sprints={[sprint]} users={project.users} />
            </Col>
            {backlogHistory && (
              <Col xs={24} md={12}>
                <DailyCompletedPointsBarGraph
                  backlogHistory={backlogHistory.filter((b) => b.sprint_id === sprint.id)}
                  showButton
                />
              </Col>
            )}
          </Row>
        )}
        <Divider />
        {backlogHistory && <BurnDownChart includeTitle sprint={sprint} backlogHistory={backlogHistory} />}
      </Card>
    )
  );
};

export default SprintSummaryCard;
