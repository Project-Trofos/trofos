import React from "react"
import { Layout, Tabs } from "antd"
import UserInformationTab from "../components/tabs/UserInformation";
import ChangePasswordTab from "../components/tabs/ChangePassword";

const { Content } = Layout;

export default function AccountPage() : JSX.Element {

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Content style={{ minHeight: 360 }}>
                <Tabs centered>
                    <Tabs.TabPane tab="User Information" key="user-information">
                        <UserInformationTab />
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="Change Password" key="change-password">
                        <ChangePasswordTab />
                    </Tabs.TabPane>
                </Tabs>
            </Content>
        </Layout>
    )
}