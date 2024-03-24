import React from 'react';
import { Card, Divider } from 'antd';
import { useGetSprintsByProjectIdQuery } from '../../api/sprint';
import { Subheading } from '../typography';
import UserBacklogPieChart from '../visualization/UserBacklogPieChart';
import { useGetProjectBacklogHistoryQuery } from '../../api/backlog';
import { useProjectIdParam } from '../../api/hooks';
import { useGetProjectQuery } from '../../api/project';
import VelocityGraph from '../visualization/VelocityGraph';
import { CumulativeFlowDiagram } from '../visualization/CumulativeFlowDiagram';
import { BurnDownChart } from '../visualization/BurnDownChart';

const ProjectSummaryCard = () => {
  const projectId = useProjectIdParam();
  const { data: project } = useGetProjectQuery({ id: projectId });
  const { data: backlogHistory } = useGetProjectBacklogHistoryQuery({ projectId });
  const { data: sprintsData } = useGetSprintsByProjectIdQuery(projectId);
  return (
    <Card>
      {sprintsData && (
        <>
          <Subheading>Sprint Velocity</Subheading>
          <VelocityGraph sprints={sprintsData.sprints} />
          <Divider />
        </>
      )}
      {backlogHistory && (
        <>
          <Subheading>Cumulative Flow Diagram</Subheading>
          <CumulativeFlowDiagram backlogHistory={backlogHistory} />
          <Divider />
          <Subheading>Overall Burndown</Subheading>
          <BurnDownChart backlogHistory={backlogHistory} />
        </>
      )}
      {sprintsData && project && (
        <>
          <Subheading>Overall Contribution by Story Points</Subheading>
          <UserBacklogPieChart sprints={sprintsData.sprints} users={project?.users} />
          <Divider />
        </>
      )}
    </Card>
  );
};

export default ProjectSummaryCard;
