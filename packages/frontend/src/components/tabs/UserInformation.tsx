import React, {useEffect, useState} from 'react';
import { Typography, Space, Row, Col, Input, Button, message } from 'antd';
import { useGetUserInfoQuery, useUpdateUserInfoMutation } from '../../api/auth';
import { getErrorMessage } from '../../helpers/error';

/**
 * User Information tab for account
 */

export default function UserInformationTab(): JSX.Element {
  const { data: userInfo } = useGetUserInfoQuery();
  const [updateUserInfo] = useUpdateUserInfoMutation();

  const [displayName, setDisplayName] = useState(userInfo?.userDisplayName)

  useEffect(() => {
    setDisplayName(userInfo?.userDisplayName);
  }, [userInfo]);

  const handleSave = () => {
    handleUpdateDisplayName();
  }

  const handleUpdateDisplayName =
    async () => {
      try {
          if (displayName && userInfo) {
            await updateUserInfo({
              displayName,
              userId: userInfo.userId,
            }).unwrap();
            message.success('Display name changed!');
          }
      } catch (e) {
        console.error(getErrorMessage(e));
        message.error('Failed to modify user display name');
      }
    }

  return (
    <Row>
      <Col offset={1}>
        <Typography.Title level={2}>User Information</Typography.Title>
        <Space direction="vertical">
          <Space>
            <Typography.Title level={3}>Email Address:</Typography.Title>
            <Typography.Title level={3}>{userInfo?.userEmail}</Typography.Title>
          </Space>
          <Space>
            <Typography.Title level={3}>Display Name:</Typography.Title>
              <Input 
                onChange={(e) => setDisplayName(e.target.value)}
                value={displayName}
              />
          </Space>
          <Button type="primary" onClick={handleSave}>Save</Button>
        </Space>
      </Col>
    </Row>
  );
}
