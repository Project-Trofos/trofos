import React from 'react';
import { Row, Col, Table, Switch, message } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useGetFeatureFlagsQuery, useToggleFeatureFlagMutation } from '../../api/featureFlag';

export default function FeatureFlagManagement(): JSX.Element {
  const { data: featureFlags, isLoading, refetch } = useGetFeatureFlagsQuery();
  const [toggleFeatureFlag, { isLoading: isToggling }] = useToggleFeatureFlagMutation();

  const handleToggle = async (featureName: string, active: boolean) => {
    try {
      await toggleFeatureFlag({ featureName, active: !active }).unwrap();
      message.success(`Feature "${featureName}" has been ${!active ? 'enabled' : 'disabled'}`);
      refetch(); // Refresh the data after mutation
    } catch (error) {
      message.error(`Failed to update feature "${featureName}".`);
    }
  };

  return (
    <Row>
      <Col offset={6} span={12}>
        <Table dataSource={featureFlags} rowKey={(flag) => flag.feature_name} bordered pagination={{ pageSize: 10 }}>
          <Table.Column width={300} title="Feature Name" dataIndex="feature_name" />
          <Table.Column width={300}
            title="Enabled"
            dataIndex="active"
            render={(checked, record, index) => (
              <Switch
                checkedChildren={<CheckOutlined />}
                unCheckedChildren={<CloseOutlined />}
                checked={checked}
                disabled={isLoading || isToggling}
                onChange={() => handleToggle(record.feature_name, checked)}
                loading={isToggling || isLoading}
              />
            )}
          />
        </Table>
      </Col>
    </Row>
  );
}
