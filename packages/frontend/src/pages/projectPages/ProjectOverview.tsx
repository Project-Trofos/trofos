import { skipToken } from '@reduxjs/toolkit/dist/query/react';
import { useCourse, useProjectIdParam } from '../../api/hooks';
import { useGetSprintsByProjectIdQuery } from '../../api/sprint';
import MilestoneCard from '../../components/cards/MilestoneCard';
import VisualizationCard from '../../components/cards/VisualizationCard';
import Container from '../../components/layouts/Container';
import { useGetProjectBacklogHistoryQuery } from '../../api/backlog';
import ProjectStatisticsCard from '../../components/cards/ProjectStatisticsCard';
import { useGetProjectQuery } from '../../api/project';

export default function Overview(): JSX.Element {
  const projectId = useProjectIdParam();
  const { data: project } = useGetProjectQuery({ id: projectId });
  const { course } = useCourse(project?.course_id?.toString());
  const { data: sprintsData } = useGetSprintsByProjectIdQuery(projectId);
  const { data: backlogHistory } = useGetProjectBacklogHistoryQuery({ projectId });

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
