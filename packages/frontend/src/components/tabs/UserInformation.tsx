import React, {useEffect, useState} from 'react';
import { Typography, Space, Row, Col, Input, Button, message } from 'antd';
import { useGetUserInfoQuery, useChangeDisplayNameMutation } from '../../api/auth';
import { getErrorMessage } from '../../helpers/error';

/**
 * User Information tab for account
 */

export default function UserInformationTab(): JSX.Element {
  const { data: userInfo } = useGetUserInfoQuery();
  const [changeDisplayName] = useChangeDisplayNameMutation();

  const [displayName, setDisplayName] = useState(userInfo?.userDisplayName)

  useEffect(() => {
    setDisplayName(userInfo?.userDisplayName);
  }, [userInfo])

  const handleUpdateDisplayName =
    async () => {
      try {
          if (displayName) {
            await changeDisplayName({
              displayName,
              userId: userInfo?.userId,
            }).unwrap();
            message.success('Display name changed!');
        }
      } catch (e) {
        console.log(getErrorMessage(e));
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
                onPressEnter={handleUpdateDisplayName}
                value={displayName}
              />
          </Space>
        </Space>
      </Col>
    </Row>
  );
}
