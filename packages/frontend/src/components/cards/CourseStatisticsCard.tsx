import React from 'react';
import { Card, Row, Col, Statistic, Divider, Space } from 'antd';
import { Sprint } from '../../api/sprint';
import { Backlog, BacklogHistory, BacklogStatus, ProjectData } from '../../api/types';
import { Subheading } from '../typography';
import DailyCompletedPointsBarGraph from '../visualization/DailyCompletedPointsBarGraph';
import SprintBacklogPieChart from '../visualization/SprintBacklogPieChart';
import TeamIssuesComparisonBarGraph from '../visualization/TeamIssuesComparisonBarGraph';
import ProjectTable from '../tables/ProjectTable';
import SprintTable from '../tables/SprintTable';
import SimpleModal from '../modals/SimpleModal';

export default function CourseStatisticsCard(props: {
  projects: ProjectData[];
  sprints: Sprint[];
  unassignedBacklogs: Backlog[];
  backlogHistory: BacklogHistory[];
}) {
  const { sprints, unassignedBacklogs, backlogHistory, projects } = props;

  const activeSprints = sprints.filter((s) => s.status === 'current');

  const incompleteSprints = sprints
    .filter((s) => s.status === 'completed' || s.status === 'closed')
    .filter((s) => s.backlogs.find((b) => b.status !== BacklogStatus.DONE) !== undefined);

  const projectsWithIncompleteSprints = projects.filter(
    (p) => incompleteSprints.find((s) => s.project_id === p.id) !== undefined,
  );

  const projectsWithoutActiveSprint = projects.filter(
    (p) => activeSprints.find((s) => s.project_id === p.id) === undefined,
  );

  return (
    <Card>
      <Row gutter={[32, 32]}>
        <Col sm={6} xs={24}>
          <Statistic title="Projects" value={projects.length} />
        </Col>
        <Col sm={6} xs={24}>
          <Statistic title="Active Sprints" value={activeSprints.length} />
        </Col>
        <Col sm={6} xs={24}>
          <Statistic
            title={
              <Space>
                No Active Sprint
                {projectsWithoutActiveSprint.length > 0 && (
                  <SimpleModal buttonName="Show" modalProps={{ width: 1000 }}>
                    <ProjectTable
                      projects={projectsWithoutActiveSprint}
                      heading="Projects without active sprint"
                      onlyShowActions={['GOTO']}
                    />
                  </SimpleModal>
                )}
              </Space>
            }
            value={projectsWithoutActiveSprint.length}
          />
        </Col>
        <Col sm={6} xs={24}>
          <Statistic
            title={
              <Space>
                Incomplete Sprints
                {projectsWithIncompleteSprints.length > 0 && (
                  <SimpleModal buttonName="Show" modalProps={{ width: 1000 }}>
                    <SprintTable
                      sprints={incompleteSprints}
                      projects={projectsWithIncompleteSprints}
                      heading="Projects with incomplete sprint"
                    />
                  </SimpleModal>
                )}
              </Space>
            }
            value={projectsWithIncompleteSprints.length}
          />
        </Col>
      </Row>
      <Divider />
      <Row>
        <Col xs={24} md={12} style={{ padding: '20px' }}>
          <Subheading style={{ textAlign: 'center' }}>Active Sprint Issue Types</Subheading>
          <SprintBacklogPieChart sprints={activeSprints} unassignedBacklog={unassignedBacklogs} />
        </Col>
        <Col xs={24} md={12} style={{ padding: '20px' }}>
          <Subheading style={{ textAlign: 'center' }}>Daily Completed Story Points</Subheading>
          <DailyCompletedPointsBarGraph backlogHistory={backlogHistory} />
        </Col>
      </Row>
      <Divider />
      <Row>
        <Col xs={24} md={24} style={{ padding: '20px' }}>
          <Subheading style={{ textAlign: 'center' }}>Active Sprint Team Issues</Subheading>
          <TeamIssuesComparisonBarGraph activeSprints={activeSprints} projects={projects} />
        </Col>
      </Row>
    </Card>
  );
}
