import React from 'react';
import { useParams } from 'react-router-dom';
import { useGetActiveSprintQuery, useGetSprintsByProjectIdQuery } from '../api/sprint';
import Container from '../components/layouts/Container';
import ScrumBoard from '../components/board/ScrumBoard';
import { Heading } from '../components/typography';

import './ScrumBoardPage.css';

export default function ActiveScrumBoardPage(): JSX.Element {
  const params = useParams();
  const projectId = Number(params.projectId);
  const { data: activeSprint } = useGetActiveSprintQuery(projectId);

  return (
    <Container noGap fullWidth className="scrum-board-container">
      <ScrumBoard projectId={projectId} sprint={activeSprint} />
    </Container>
  );
}

export function SprintScrumBoardPage(): JSX.Element {
  const params = useParams();
  const projectId = Number(params.projectId);
  const sprintId = Number(params.sprintId);
  const { data: sprints } = useGetSprintsByProjectIdQuery(projectId);
  const sprint = sprints?.sprints.find((s) => s.id === sprintId);

  return (
    <Container noGap fullWidth className="scrum-board-container">
      <Heading style={{ marginLeft: '10px' }}>{sprint?.name}</Heading>
      <ScrumBoard projectId={projectId} sprint={sprint} />
    </Container>
  );
}
