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
        <Tabs centered>
          <Tabs.TabPane tab="User Management" key="user-management">
            <UserManagementTab />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Role Management" key="role-management">
            <RoleManagementTab />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Settings Management" key="settings-management">
            <SettingsManagementTab />
          </Tabs.TabPane>
        </Tabs>
      </Content>
    </Layout>
  );
}

export default Admin;
