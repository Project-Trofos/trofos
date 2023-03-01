import React from 'react';
import { Card, Row, Col, Statistic, Divider, Space } from 'antd';
import { Sprint } from '../../api/sprint';
import { Backlog, BacklogHistory, ProjectData } from '../../api/types';
import { Subheading } from '../typography';
import DailyCompletedPointsBarGraph from '../visualization/DailyCompletedPointsBarGraph';
import SprintBacklogPieChart from '../visualization/SprintBacklogPieChart';

export default function CourseOverviewCard(props: {
  projects: ProjectData[];
  sprints: Sprint[];
  unassignedBacklogs: Backlog[];
  backlogHistory: BacklogHistory[];
}) {
  const { sprints, unassignedBacklogs, backlogHistory, projects } = props;
  const activeSprints = sprints.filter((s) => s.status === 'current');

  return (
    <Card>
      <Row gutter={[32, 32]}>
        <Col sm={6} xs={24}>
          <Statistic title="Projects" value={projects.length} />
        </Col>
        <Col sm={6} xs={24}>
          <Statistic title="Current Active Sprints" value={activeSprints.length} />
        </Col>
        <Col sm={6} xs={24}>
          <Statistic
            title="Completed Issues"
            value={activeSprints.flatMap((s) => s.backlogs).filter((b) => b.status === 'Done').length}
            suffix={`/ ${activeSprints.flatMap((s) => s.backlogs).length}`}
          />
        </Col>
        <Col sm={6} xs={24}>
          <Statistic title="Backlogs" value={unassignedBacklogs.length} />
        </Col>
      </Row>
      <Divider />
      <Row>
        <Col xs={24} md={12}>
          <Space direction="vertical" style={{ width: '100%', alignItems: 'center' }}>
            <Subheading>Active Sprint Issue Types</Subheading>
            <SprintBacklogPieChart sprints={activeSprints} unassignedBacklog={unassignedBacklogs} />
          </Space>
        </Col>
        <Col xs={24} md={12}>
          <Space direction="vertical" style={{ width: '100%', alignItems: 'center' }}>
            <Subheading>Daily Completed Story Points</Subheading>
            <DailyCompletedPointsBarGraph backlogHistory={backlogHistory} />
          </Space>
        </Col>
      </Row>
    </Card>
  );
}
