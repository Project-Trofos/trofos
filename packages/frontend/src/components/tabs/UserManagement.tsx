import React from "react";
import { Row, Col, Divider } from 'antd';
import UserTable from "../tables/UserTable";
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
                <UserTable users={getUsers}/>
            </Col>
        </Row>
    )
}