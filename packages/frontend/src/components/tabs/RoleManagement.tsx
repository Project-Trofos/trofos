import React, { useState } from "react"
import { Space, Row, Col, Select } from 'antd';
import { useGetActionsOnRolesQuery, useGetActionsQuery } from "../../api/role"
import RoleTransfer from "../transfer/RoleTransfer";

const { Option } = Select;

/**
 * Role management tab for admin
 */
export default function RoleManagement() : JSX.Element {

    const { data : actions } = useGetActionsQuery();
    const { data : actionsOnRoles } = useGetActionsOnRolesQuery();

    const [activeRole, setActiveRole] = useState(0);

    const handleRoleChange = (value: number) => {
       setActiveRole(value);
    };

    return (
        <Row>
            <Col offset={6} span={12}>
                <Space direction="vertical" size="large">
                    <Select style={{width: 120}} onChange={handleRoleChange}>
                        {actionsOnRoles?.map(action => <Option key={action.id} value={action.id}>{action.role_name}</Option>)}
                    </Select>
                    <RoleTransfer actionsOnRoles={actionsOnRoles} actions={actions} activeRole={activeRole}/>
                </Space>
            </Col>
      </Row>
    )
}