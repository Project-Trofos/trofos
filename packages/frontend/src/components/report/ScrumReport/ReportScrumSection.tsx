import React from 'react';
import { useParams } from 'react-router-dom';
import { useGetSprintsByProjectIdQuery } from '../../../api/sprint';
import Container from '../../layouts/Container';
import { Heading } from '../../typography';
import ReportScrumBoard from './ReportScrumBoard';

export function ReportScrumSection(): JSX.Element {
  const params = useParams();
  const projectId = Number(params.projectId);
  const { data: sprints } = useGetSprintsByProjectIdQuery(projectId);

  return (
    <div>
      {sprints?.sprints.map((sprint) => (
        <Container noGap fullWidth className="scrum-board-container">
          <Heading style={{ marginLeft: '10px' }}>{sprint.name}</Heading>
          <ReportScrumBoard projectId={projectId} sprint={sprint} />
        </Container>
      ))}
    </div>
  );
}
