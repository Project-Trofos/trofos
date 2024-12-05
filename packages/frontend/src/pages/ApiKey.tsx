import React from 'react';
import Container from '../components/layouts/Container';
import { Card, Col, Row, Space } from 'antd';
import { Heading } from '../components/typography';
import UserApiKeyTable from '../components/tables/UserApiKeyTable';
import PageTitle from '../components/pageheader/PageTitle';

function ApiKey(): JSX.Element {

  return (
    <Container fullWidth noGap>
      <PageTitle title="API Keys"/>
      <Space direction="vertical" style={{width: '100%'}}>
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
