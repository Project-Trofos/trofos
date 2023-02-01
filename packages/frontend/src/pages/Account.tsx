import React from 'react';
import { Layout, Tabs } from 'antd';
import UserInformationTab from '../components/tabs/UserInformation';
import ChangePasswordTab from '../components/tabs/ChangePassword';
import UserAccessTab from '../components/tabs/UserAccess';

const { Content } = Layout;

export default function AccountPage(): JSX.Element {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ minHeight: 360 }}>
        <Tabs
          items={[
            { key: 'user-information', label: 'User Information', children: <UserInformationTab /> },
            { key: 'change-password', label: 'Change Password', children: <ChangePasswordTab /> },
            { key: 'access-management', label: 'Access Management', children: <UserAccessTab /> },
          ]}
          centered
        />
      </Content>
    </Layout>
  );
}
