import React from 'react';
import { skipToken } from '@reduxjs/toolkit/dist/query/react';
import { useParams } from 'react-router-dom';
import { useCourse, useProject } from '../api/hooks';
import { useGetSprintsByProjectIdQuery } from '../api/sprint';
import MilestoneCard from '../components/cards/MilestoneCard';
import VisualizationCard from '../components/cards/VisualizationCard';
import Container from '../components/layouts/Container';
import { useGetProjectBacklogHistoryQuery } from '../api/backlog';
import ProjectStatisticsCard from '../components/cards/ProjectStatisticsCard';

export default function Overview(): JSX.Element {
  const params = useParams();
  const { project } = useProject(Number(params.projectId));
  const { course } = useCourse(project?.course_id?.toString());
  const { data: sprintsData } = useGetSprintsByProjectIdQuery(project?.id ?? skipToken);
  const { data: backlogHistory } = useGetProjectBacklogHistoryQuery(
    project?.id ? { projectId: project.id } : skipToken,
  );

  return (
    <Container>
      {course && <MilestoneCard course={course} showEdit={false} />}
      {sprintsData && backlogHistory && (
        <ProjectStatisticsCard
          sprints={sprintsData.sprints}
          unassignedBacklogs={sprintsData.unassignedBacklogs}
          backlogHistory={backlogHistory}
        />
      )}
      <VisualizationCard projectId={project?.id} />
    </Container>
  );
}
