import React from 'react';
import { Row, Col } from 'antd';
import { useGetSettingsQuery } from '../../api/settings';
import SettingsForm from '../forms/SettingsForm';

/**
 * Settings management tab for admin
 */
export default function SettingsManagement(): JSX.Element {
  const { data: getSettings } = useGetSettingsQuery();

  return (
    <Row>
      <Col offset={6} span={12}>
        <SettingsForm settings={getSettings} />
      </Col>
    </Row>
  );
}
