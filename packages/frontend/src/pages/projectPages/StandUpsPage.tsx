import React, { useMemo } from 'react';
import { Typography, Space, Col, Row } from 'antd';

import Container from '../../components/layouts/Container';
import { useGetStandUpsByProjectIdQuery } from '../../api/standup';
import StandUpCard from '../../components/cards/StandUpCard';
import { useParams } from 'react-router-dom';
import StandUpCreationModal from '../../components/modals/StandUpCreationModal';
import dayjs from 'dayjs';

const { Title } = Typography;

export default function StandUpsPage(): JSX.Element {
  const params = useParams();
  const projectId = Number(params.projectId);
  const { data: standUps } = useGetStandUpsByProjectIdQuery(projectId);
  return (
    <Container fullWidth noGap>
      <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Title>Stand Ups</Title>
        <StandUpCreationModal projectId={projectId} />
      </Space>
      <Row gutter={[16, 16]} wrap>
        {standUps
          ?.slice()
          .sort((a, b) => (dayjs(a.date).isBefore(dayjs(b.date)) ? 1 : -1))
          .map((standUp) => (
            <Col key={standUp.id}>
              <StandUpCard standUp={standUp} />
            </Col>
          ))}
      </Row>
    </Container>
  );
}
