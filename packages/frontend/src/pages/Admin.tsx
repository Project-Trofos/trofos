import React from 'react'
import { Layout, Tabs } from "antd"
import UserManagementTab from "../components/tabs/UserManagement";

const { Content } = Layout;


function Admin(): JSX.Element {
    return (
    <Layout style={{ minHeight: '100vh' }}>
            <Content style={{ minHeight: 360 }}>
                <Tabs centered>
                    <Tabs.TabPane tab="User Management" key="user-management">
                        <UserManagementTab />
                    </Tabs.TabPane>
                </Tabs>
            </Content>
        </Layout>
    )
}

export default Admin;