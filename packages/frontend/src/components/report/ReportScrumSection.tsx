import React, { useMemo } from 'react';
import { useGetSprintsByProjectIdQuery } from '../../api/sprint';
import Container from '../layouts/Container';
import ReportScrumBoard from './ReportScrumBoard';
import SprintSummaryCard from '../cards/SprintSummaryCard';
import { useProjectIdParam } from '../../api/hooks';
import { Typography } from 'antd';
import './ReportScrum.css';
import { ReportRetrospectiveContainer } from './ReportRetrospectiveContainer';

export function ReportScrumSection(): JSX.Element {
  const projectId = useProjectIdParam();
  const { data: sprints } = useGetSprintsByProjectIdQuery(projectId);
  const sortedSprints = useMemo(() => sprints?.sprints.toSorted((a, b) => a.id - b.id), [sprints]);

  return (
    <div>
      {sortedSprints?.map((sprint) => (
        <Container noGap key={sprint.id}>
          <Typography.Title>{sprint.name}</Typography.Title>
          <SprintSummaryCard sprint={sprint} />
          <ReportScrumBoard sprint={sprint} />
          <ReportRetrospectiveContainer sprint={sprint} />
        </Container>
      ))}
    </div>
  );
}
