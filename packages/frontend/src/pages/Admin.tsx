import React from 'react';
import { Layout, Tabs } from 'antd';
import UserManagementTab from '../components/tabs/UserManagement';
import RoleManagementTab from '../components/tabs/RoleManagement';
import SettingsManagementTab from '../components/tabs/SettingsManagement';
import './Admin.css';

const { Content } = Layout;

function Admin(): JSX.Element {
  return (
    <Layout className="admin-layout">
      <Content className="admin-content">
        <Tabs
          items={[
            { key: 'user-management', label: 'User Management', children: <UserManagementTab /> },
            { key: 'role-management', label: 'Role Management', children: <RoleManagementTab /> },
            { key: 'settings-management', label: 'Settings Management', children: <SettingsManagementTab /> },
          ]}
          centered
        />
      </Content>
    </Layout>
  );
}

export default Admin;
