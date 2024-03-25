import StandUpBoard from '../board/StandUpBoard';
import { Card, Divider, Typography } from 'antd';
import { Heading } from '../typography';
import Container from '../layouts/Container';
import { StandUp, useGetStandUpsQuery } from '../../api/standup';
import { useProjectIdParam } from '../../api/hooks';
import { useMemo } from 'react';

export function ReportStandUpSection(): JSX.Element {
  const projectId = useProjectIdParam();
  const { data: standUps } = useGetStandUpsQuery({ project_id: projectId });
  const sortedStandUps = useMemo(() => {
    if (!standUps) return [];
    return [...standUps].sort((a: StandUp, b: StandUp) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [standUps]);
  return (
    <Container noGap>
      <Typography.Title>Stand Ups</Typography.Title>
      <Card>
        <Heading>Stand Up</Heading>
        {sortedStandUps?.map((standUp) => (
          <div key={standUp.id}>
            <StandUpBoard standUp={standUp} readOnly />
            <Divider />
          </div>
        ))}
      </Card>
    </Container>
  );
}
