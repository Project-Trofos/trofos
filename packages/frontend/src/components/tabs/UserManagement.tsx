import React, { useState } from 'react';
import { Row, Col, Divider, Input, Space } from 'antd';
import AdminUserTable from '../tables/AdminUserTable';
import { useGetUsersQuery } from '../../api/user';
import AddUserModal from '../modals/AddUserModal';
import UserBulkDeletionModal from '../modals/UserBulkDeletionModal';
import { useGetRolesQuery } from '../../api/role';

/**
 * User mangement tab for admin
 */
export default function UserManagement(): JSX.Element {
  const [searchText, setSearchText] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

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
      <Col offset={4} span={16}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Space>
            <AddUserModal />
            <UserBulkDeletionModal userIds={selectedUserIds} onDeleted={() => setSelectedUserIds([])} />
          </Space>
          <Input
            placeholder='Search User by ID, Name, Email'
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: '60%' }}
          />
        </div>
        <Divider />
        <AdminUserTable
          users={filteredUsers}
          roles={getRoles}
          showSelect
          onSelectChange={(keys) => setSelectedUserIds(keys.map(Number))}
        />
      </Col>
    </Row>
  );
}
