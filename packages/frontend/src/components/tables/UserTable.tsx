import React from 'react';
import { Button, Card, Space, Table, Tag } from 'antd';
import { CourseData, UserData, UserOnRolesOnCourse, ActionsOnRoles } from '../../api/types';
import { Subheading } from '../typography';
import UserTableRoleManagementModal from '../modals/UserTableRoleManagementModal';

type UserTableProps = {
  users: CourseData['users'] | undefined;
  userRoles: UserOnRolesOnCourse[] | undefined;
  actionsOnRoles: ActionsOnRoles[] | undefined;
  isLoading: boolean;
  heading?: string;
  control?: React.ReactNode;
  myUserId?: number | undefined;
  handleRemoveUser?: (userId: number) => void;
  handleUpdateUserRole?: (userEmail: string, roleId: number, userId: number) => void;
};

/**
 * Table for listing users
 */
export default function UserTable({
  users,
  userRoles,
  actionsOnRoles,
  isLoading,
  heading,
  control,
  myUserId,
  handleRemoveUser,
  handleUpdateUserRole,
}: UserTableProps) {
  return (
    <Card className="table-card">
      <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
        <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Subheading>{heading ?? 'People'}</Subheading>
          {control}
        </Space>
        <Table
          dataSource={users}
          rowKey={(user) => user.user.user_id}
          loading={isLoading}
          bordered
          size="small"
          pagination={{ pageSize: 5 }}
        >
          <Table.Column
            width={150}
            title="ID"
            dataIndex={['user', 'user_id']}
            sorter={(a: UserData, b: UserData) => a.user.user_id - b.user.user_id}
            render={(values, record, _) => (
              <>
                {record.user.user_id} {Number(record.user.user_id) === myUserId && <Tag color="blue">You</Tag>}
              </>
            )}
          />
          <Table.Column
            title="Email"
            dataIndex={['user', 'user_email']}
            sorter={(a: UserData, b: UserData) => a.user.user_email.localeCompare(b.user.user_email)}
          />
          <Table.Column
            width={150}
            title="Action"
            dataIndex="action"
            render={(_, record: UserData) => (
              <Space size="middle">
                {handleRemoveUser && (
                  <Button size="small" onClick={() => handleRemoveUser(record.user.user_id)}>
                    Remove
                  </Button>
                )}
                {handleUpdateUserRole && (
                  <UserTableRoleManagementModal
                    userRoleId={userRoles?.find((userRole) => userRole.user_email === record.user.user_email)?.role.id}
                    userRoleName={
                      userRoles?.find((userRole) => userRole.user_email === record.user.user_email)?.role.role_name
                    }
                    userEmail={record.user.user_email}
                    userId={record.user.user_id}
                    roles={actionsOnRoles}
                    handleRoleChange={handleUpdateUserRole}
                  />
                )}
              </Space>
            )}
          />
        </Table>
      </Space>
    </Card>
  );
}
