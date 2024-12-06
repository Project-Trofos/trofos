import React from 'react';
import { Typography, Space, Col, Row, Empty } from 'antd';

import { useGetStandUpHeadersByProjectIdQuery } from '../../api/standup';
import StandUpCard from '../../components/cards/StandUpCard';
import { useParams } from 'react-router-dom';
import StandUpCreationModal from '../../components/modals/StandUpCreationModal';
import dayjs from 'dayjs';
import GenericBoxWithBackground from '../../components/layouts/GenericBoxWithBackground';

const { Title } = Typography;

export default function StandUpsPage(): JSX.Element {
  const params = useParams();
  const projectId = Number(params.projectId);
  const { data: standUps } = useGetStandUpHeadersByProjectIdQuery(projectId);
  return (
    <GenericBoxWithBackground>
      <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Title>Stand Ups</Title>
        <StandUpCreationModal projectId={projectId} />
      </Space>
      {
        standUps && standUps.length > 0 ? (<Row gutter={[16, 16]} wrap>
          {standUps
            ?.slice()
            .sort((a, b) => (dayjs(a.date).isBefore(dayjs(b.date)) ? 1 : -1))
            .map((standUp) => (
              <Col key={standUp.id}>
                <StandUpCard standUp={standUp} />
              </Col>
            ))}
        </Row>) :
        (<Empty description="No standups found"/>)
      }
    </GenericBoxWithBackground>
  );
}
