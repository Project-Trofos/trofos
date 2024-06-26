import React from 'react';
import { Card, Row, Col, Statistic, Divider, Typography } from 'antd';
import Countdown from 'antd/es/statistic/Countdown';
import { Sprint } from '../../api/sprint';
import { Backlog, BacklogHistory, BacklogStatus } from '../../api/types';
import { Subheading } from '../typography';
import DailyCompletedPointsBarGraph from '../visualization/DailyCompletedPointsBarGraph';
import SprintBacklogPieChart from '../visualization/SprintBacklogPieChart';

export default function ProjectStatisticsCard(props: {
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
                value={activeSprint.backlogs.filter((b) => b.status === BacklogStatus.DONE).length}
                suffix={`/ ${activeSprint.backlogs.length}`}
              />
            </Col>
            <Col sm={6} xs={24}>
              <Statistic title="Backlogs" value={unassignedBacklogs.length} />
            </Col>
            <Col sm={6} xs={24}>
              <Countdown
                title="Time before end of sprint"
                value={activeSprint.end_date}
                format="D [day(s)] HH [hour(s)]"
              />
            </Col>
          </Row>
          <Divider />
          <Row>
            <Col xs={24} md={12} style={{ padding: '20px' }}>
              <Subheading style={{ textAlign: 'center' }}>Active Sprint Issue Types</Subheading>
              <SprintBacklogPieChart sprints={[activeSprint]} unassignedBacklog={unassignedBacklogs} showButton />
            </Col>
            <Col xs={24} md={12} style={{ padding: '20px' }}>
              <DailyCompletedPointsBarGraph
                backlogHistory={backlogHistory.filter((b) => b.sprint_id === activeSprint.id)}
                showButton
              />
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
