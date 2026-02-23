import React, { useState } from 'react';
import { Row, Col, Divider, Input } from 'antd';
import AdminUserTable from '../tables/AdminUserTable';
import { useGetUsersQuery } from '../../api/user';
import AddUserModal from '../modals/AddUserModal';
import { useGetRolesQuery } from '../../api/role';

/**
 * User mangement tab for admin
 */
export default function UserManagement(): JSX.Element {
  const [searchText, setSearchText] = useState('');
  const { data: getUsers } = useGetUsersQuery();
  const { data: getRoles } = useGetRolesQuery();

  const filteredUsers = getUsers?.filter((user: any) => {
    const search = searchText.toLowerCase();
    const email = user.userEmail || user.user_email;
    const name = user.userDisplayName || user.user_display_name;
    const id = user.userId || user.user_id;

    return (
      email?.toLowerCase().includes(search) ||
      name?.toLowerCase().includes(search) ||
      id?.toString().includes(search)
    );
  });

  return (
    <Row>
      <Col offset={6} span={12}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <AddUserModal />
          <Input
            placeholder="Search User by ID, Name, Email"
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: '50%' }}
          />
        </div>
        <Divider />
        <AdminUserTable users={filteredUsers} roles={getRoles} />
      </Col>
    </Row>
  );
}
