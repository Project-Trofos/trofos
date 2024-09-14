import React from 'react';
import Container from '../components/layouts/Container';
import { Card, Col, Row, Space } from 'antd';
import { Heading } from '../components/typography';
import UserApiKeyTable from '../components/tables/UserApiKeyTable';

function ApiKey(): JSX.Element {

  return (
    <Container>
      <Space direction="vertical" style={{width: '100%'}}>
        <Heading>API Keys</Heading>
        <Row gutter={[16, 16]} itemType="flex">
          <Col span={24}>
            <Card>
              <UserApiKeyTable/>
            </Card>
          </Col>
        </Row>
      </Space>
    </Container>
  );
}

export default ApiKey;
