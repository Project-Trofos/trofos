import React from "react"
import { Typography, Space, Row, Col } from "antd"
import { useGetUserInfoQuery } from "../../api/auth";

/**
 * User Information tab for account
 */
export default function UserInformationTab() : JSX.Element {

    const { data: userInfo } = useGetUserInfoQuery();

    return (
        <Row>
            <Col offset={1}>
                <Typography.Title level={2}>
                    User Information
                </Typography.Title>
                <Space>
                    <Typography.Title level={3}>
                        Email Address:
                    </Typography.Title>
                    <Typography.Title level={3}>
                        {userInfo?.userEmail}
                    </Typography.Title>
                </Space>
            </Col>
        </Row>
    )
}