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
import SimpleModal from '../modals/ProjectTableModal';

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
  const projectWithoutSprint = projects.filter((p) => activeSprints.find((s) => s.project_id === p.id) === undefined);

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
                {projectWithoutSprint.length > 0 && (
                  <SimpleModal buttonName="Show" modalProps={{ width: 1000 }}>
                    <ProjectTable
                      projects={projectWithoutSprint}
                      isLoading={false}
                      heading="Projects without active sprint"
                      showActions={['GOTO']}
                    />
                  </SimpleModal>
                )}
              </Space>
            }
            value={projectWithoutSprint.length}
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
                      isLoading={false}
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
      <Divider />
      <Row>
        <Col xs={24} md={24} style={{ display: 'flex', flexDirection: 'column', padding: '10px' }}>
          <Subheading style={{ textAlign: 'center' }}>Active Sprint Team Issues</Subheading>
          <TeamIssuesComparisonBarGraph activeSprints={activeSprints} projects={projects} />
        </Col>
      </Row>
    </Card>
  );
}
