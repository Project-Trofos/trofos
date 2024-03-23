import StandUpBoard from '../../board/StandUpBoard';
import { Card, Divider, Typography } from 'antd';
import { Heading } from '../../typography';
import Container from '../../layouts/Container';
import { useGetStandUpsQuery } from '../../../api/standup';
import { useProjectIdParam } from '../../../api/hooks';

export function ReportStandUpSection(): JSX.Element {
  const projectId = useProjectIdParam();
  const { data: standUps } = useGetStandUpsQuery({ project_id: projectId });
  const sortedStandUps = standUps?.toSorted((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
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
