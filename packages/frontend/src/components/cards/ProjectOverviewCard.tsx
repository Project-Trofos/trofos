import React from 'react';
import { Card, Row, Col, Statistic, Divider, Space, Typography } from 'antd';
import Countdown from 'antd/es/statistic/Countdown';
import { Sprint } from '../../api/sprint';
import { Backlog, BacklogHistory } from '../../api/types';
import { Subheading } from '../typography';
import DailyCompletedPointsBarGraph from '../visualization/DailyCompletedPointsBarGraph';
import SprintBacklogPieChart from '../visualization/SprintBacklogPieChart';

export default function ProjectOverviewCard(props: {
  sprints: Sprint[];
  unassignedBacklogs: Backlog[];
  backlogHistory: BacklogHistory[];
}) {
  const { sprints, unassignedBacklogs, backlogHistory } = props;
  const activeSprint = sprints.find((s) => s.status === 'current');
  return (
    <Card style={{ height: '100%' }}>
      {activeSprint ? (
        <>
          <Row gutter={[32, 32]}>
            <Col sm={6} xs={24}>
              <Statistic title="Current Active Sprint" value={activeSprint.name} />
            </Col>
            <Col sm={6} xs={24}>
              <Statistic
                title="Completed Issues"
                value={activeSprint.backlogs.filter((b) => b.status === 'Done').length}
                suffix={`/ ${activeSprint.backlogs.length}`}
              />
            </Col>
            <Col sm={6} xs={24}>
              <Statistic title="Backlogs" value={unassignedBacklogs.length} />
            </Col>
            <Col sm={6} xs={24}>
              <Countdown title="Time before end of sprint" value={activeSprint.end_date} format="D day HH hour" />
            </Col>
          </Row>
          <Divider />
          <Row>
            <Col xs={24} md={12}>
              <Space direction="vertical" style={{ width: '100%', alignItems: 'center' }}>
                <Subheading>Active Sprint Issue Types</Subheading>
                <SprintBacklogPieChart sprint={activeSprint} unassignedBacklog={unassignedBacklogs} />
              </Space>
            </Col>
            <Col xs={24} md={12}>
              <Space direction="vertical" style={{ width: '100%', alignItems: 'center' }}>
                <Subheading>Daily Completed Story Points</Subheading>
                <DailyCompletedPointsBarGraph
                  backlogHistory={backlogHistory.filter((b) => b.sprint_id === activeSprint.id)}
                />
              </Space>
            </Col>
          </Row>
        </>
      ) : (
        <Typography.Text>
          There are no active sprint currently, start a sprint to see statistics related to that sprint.
        </Typography.Text>
      )}
    </Card>
  );
}
