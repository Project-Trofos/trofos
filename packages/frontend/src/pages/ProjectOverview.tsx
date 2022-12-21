import React from 'react';
import { useParams } from 'react-router-dom';
import { useProject } from '../api/hooks';
import MilestoneCard from '../components/cards/MilestoneCard';
import Container from '../components/layouts/Container';

export default function Overview(): JSX.Element {
  const params = useParams();
  const { course } = useProject(Number(params.projectId));
  return (
    <Container>
      <MilestoneCard course={course} showEdit={false} />
    </Container>
  );
}
