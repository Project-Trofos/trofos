import React from "react";
import { Row, Col, Divider } from 'antd';
import AdminUserTable from "../tables/AdminUserTable";
import { useGetUsersQuery } from "../../api/user";
import AddUserModal from "../modals/AddUserModal";


/**
 * User mangement tab for admin
 */
export default function UserManagement() : JSX.Element {

    const { data: getUsers } = useGetUsersQuery();

    return (
        <Row>
            <Col offset={6} span={12}>
                <AddUserModal/>
                <Divider />
                <AdminUserTable users={getUsers}/>
            </Col>
        </Row>
    )
}