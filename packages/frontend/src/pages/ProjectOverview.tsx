import React from 'react';
import { useParams } from 'react-router-dom';
import { useCourse, useProject } from '../api/hooks';
import MilestoneCard from '../components/cards/MilestoneCard';
import VisualizationCard from '../components/cards/VisualizationCard';
import Container from '../components/layouts/Container';

export default function Overview(): JSX.Element {
  const params = useParams();
  const { project } = useProject(Number(params.projectId));
  const { course } = useCourse(project?.course_id?.toString());

  return (
    <Container>
      <MilestoneCard course={course} showEdit={false} />

      <VisualizationCard projectId={project?.id} />
    </Container>
  );
}
