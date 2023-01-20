import React from 'react';
import { Row, Col, Divider } from 'antd';
import AdminUserTable from '../tables/AdminUserTable';
import { useGetUsersQuery } from '../../api/user';
import AddUserModal from '../modals/AddUserModal';
import { useGetRolesQuery } from '../../api/role';

/**
 * User mangement tab for admin
 */
export default function UserManagement(): JSX.Element {
  const { data: getUsers } = useGetUsersQuery();
  const { data : getRoles } = useGetRolesQuery();

  console.log(getRoles);

  return (
    <Row>
      <Col offset={6} span={12}>
        <AddUserModal />
        <Divider />
        <AdminUserTable users={getUsers} roles={getRoles}/>
      </Col>
    </Row>
  );
}
