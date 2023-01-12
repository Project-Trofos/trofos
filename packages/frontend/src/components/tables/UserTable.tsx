import React from 'react';
import { Button, Card, Space, Table, Tag } from 'antd';
import { CourseData, UserData, UserOnRolesOnCourse } from '../../api/types';
import { useGetActionsOnRolesQuery } from '../../api/role';
import { Subheading } from '../typography';
import UserTableRoleManagementModal from '../modals/UserTableRoleManagementModal';

type UserTableProps = {
  users: CourseData['users'] | undefined;
  userRoles: UserOnRolesOnCourse[] | undefined;
  isLoading: boolean;
  heading?: string;
  control?: React.ReactNode;
  myUserId?: number | undefined;
  handleRemoveUser?: (userId: number) => void;
  handleUpdateUserRole? : (userEmail: string, roleId: number) => void;
};

/**
 * Table for listing users
 */
export default function UserTable({ users, userRoles, isLoading, heading, control, myUserId, handleRemoveUser, handleUpdateUserRole }: UserTableProps) {

  const { data: actionsOnRoles } = useGetActionsOnRolesQuery();

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
              <>
                <Space size="middle">
                  {handleRemoveUser && (
                    <Button size="small" onClick={() => handleRemoveUser(record.user.user_id)}>
                      Remove
                    </Button>
                  )}
                </Space>
                <Space size="middle">
                {handleUpdateUserRole && (
                  <UserTableRoleManagementModal
                    userRoleId = {
                      userRoles?.filter(userRole => userRole.user_email === record.user.user_email)[0].role.id
                    }
                    userRoleName = { 
                      userRoles?.filter(userRole => userRole.user_email === record.user.user_email)[0].role.role_name
                    }
                    userEmail = {record.user.user_email}
                    roles={actionsOnRoles}
                    handleRoleChange={handleUpdateUserRole}
                  />
                )}
              </Space>
            </>
            )}
          />
        </Table>
      </Space>
    </Card>
  );
}
