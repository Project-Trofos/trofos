import React from 'react';
import { Layout, Tabs, theme } from 'antd';
import UserManagementTab from '../components/tabs/UserManagement';
import RoleManagementTab from '../components/tabs/RoleManagement';
import SettingsManagementTab from '../components/tabs/SettingsManagement';
import './Admin.css';
import PageHeader from '../components/pageheader/PageHeader';
import Container from '../components/layouts/Container';
import FeatureFlagManagement from '../components/tabs/FeatureFlagManagement';

const { Content } = Layout;

function Admin(): JSX.Element {
  const { token } = theme.useToken();

  return (
    <Container fullWidth noGap>
      <PageHeader title="Admin Console" />
      <Tabs
        items={[
          { key: 'user-management', label: 'User Management', children: <UserManagementTab /> },
          { key: 'role-management', label: 'Role Management', children: <RoleManagementTab /> },
          { key: 'settings-management', label: 'Settings Management', children: <SettingsManagementTab /> },
          { key: 'feature-flags', label: 'Feature Flags', children: <FeatureFlagManagement />},
        ]}
        centered
        style={{
          width: '100%',
          marginBottom: 8,
          padding: 16,
          backgroundColor: token.colorBgContainer,
          borderRadius: token.borderRadiusLG,
        }}
      />
    </Container>
  );
}

export default Admin;
