import React, { useMemo } from 'react';
import { Button, message, Space, Table, Tag } from 'antd';
import { CourseData, UserData, UserOnRolesOnCourse, ActionsOnRoles } from '../../api/types';
import { Subheading } from '../typography';
import UserTableRoleManagementModal from '../modals/UserTableRoleManagementModal';
import { FACULTY_ROLE_ID } from '../../api/role';

type UserTableProps = {
  users?: CourseData['users'];
  userRoles?: UserOnRolesOnCourse[];
  actionsOnRoles?: ActionsOnRoles[];
  isLoading?: boolean;
  heading?: string;
  control?: React.ReactNode;
  onlyShowActions?: ('REMOVE' | 'ROLE')[];
  myUserId?: number | undefined;
  hideIdByRoleProp?: { iAmAdmin: boolean | undefined; isHideIdByRole: true } | undefined;
  handleRemoveUser?: (userId: number) => void;
  handleUpdateUserRole?: (roleId: number, userId: number) => void;
  showSelect?: boolean;
  onSelectChange?: (selectedKeys: React.Key[]) => void;
  footer?: string;
  pagination?: false;
  ownerId?: number | null;
};

/**
 * Table for listing users
 */
export default function UserTable(props: UserTableProps) {
  const {
    users,
    actionsOnRoles,
    control,
    handleRemoveUser,
    handleUpdateUserRole,
    heading,
    isLoading,
    myUserId,
    hideIdByRoleProp,
    onSelectChange,
    onlyShowActions,
    showSelect,
    userRoles,
    footer,
    pagination,
    ownerId,
  } = props;

  const userIdToRole = useMemo(() => {
    const map = new Map<number, UserOnRolesOnCourse>();

    users?.forEach((u) => {
      const role = userRoles?.find((ur) => ur.user_id === u.user.user_id);
      if (role) {
        map.set(u.user.user_id, role);
      }
    });

    return map;
  }, [users, userRoles]);

  const currentUserIsFacultyOrAdmin = useMemo(() => {
    return (
      hideIdByRoleProp?.iAmAdmin || userRoles?.some((ur) => ur.user_id === myUserId && ur.role_id === FACULTY_ROLE_ID)
    );
  }, [hideIdByRoleProp, userRoles, myUserId]);

  return (
    <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
      <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
        {heading && <Subheading>{heading}</Subheading>}
        {control}
      </Space>
      <Table
        rowSelection={
          showSelect
            ? {
                onChange: (keys) => {
                  if (onSelectChange) {
                    onSelectChange(keys);
                  }
                },
              }
            : undefined
        }
        dataSource={users}
        rowKey={(user) => user.user.user_id}
        loading={isLoading}
        bordered
        size="small"
        footer={footer ? () => footer : undefined}
        pagination={pagination}
      >
        {((hideIdByRoleProp?.isHideIdByRole && currentUserIsFacultyOrAdmin) || !hideIdByRoleProp) && (
          <Table.Column
            width={150}
            title="ID"
            dataIndex={['user', 'user_id']}
            sorter={(a: UserData, b: UserData) => a.user.user_id - b.user.user_id}
            render={(_values, record, _) => (
              <>
                {record.user.user_id} {Number(record.user.user_id) === myUserId && <Tag color="blue">You</Tag>}
                {Number(record.user.user_id) === ownerId && <Tag color="orange">Owner</Tag>}
              </>
            )}
          />
        )}
        <Table.Column
          title="Email"
          dataIndex={['user', 'user_email']}
          sorter={(a: UserData, b: UserData) => a.user.user_email.localeCompare(b.user.user_email)}
          render={(_values, record, _) => (
            <>
              {record.user.user_email}{' '}
              {hideIdByRoleProp?.isHideIdByRole && !currentUserIsFacultyOrAdmin && (
                <>
                  {Number(record.user.user_id) === myUserId && <Tag color="blue">You</Tag>}
                  {Number(record.user.user_id) === ownerId && <Tag color="orange">Owner</Tag>}
                </>
              )}
            </>
          )}
        />
        <Table.Column title="Display Name" dataIndex={['user', 'user_display_name']} />
        {(!onlyShowActions || onlyShowActions.includes('ROLE')) && (
          <Table.Column
            width={150}
            title="Role"
            dataIndex="role"
            sorter={(a: UserData, b: UserData) =>
              (userIdToRole.get(a.user.user_id)?.role.role_name ?? '').localeCompare(
                userIdToRole.get(b.user.user_id)?.role.role_name ?? '',
              )
            }
            render={(_, record: UserData) =>
              userRoles &&
              // Only show role modal if handleUpdateUserRole is supplied
              (handleUpdateUserRole ? (
                <UserTableRoleManagementModal
                  userRoleId={userIdToRole.get(record.user.user_id)?.role.id}
                  userRoleName={userIdToRole.get(record.user.user_id)?.role.role_name}
                  userEmail={record.user.user_email}
                  userId={record.user.user_id}
                  roles={actionsOnRoles}
                  handleRoleChange={handleUpdateUserRole}
                  isProjectOwner={record.user.user_id == ownerId}
                />
              ) : (
                userIdToRole.get(record.user.user_id)?.role.role_name
              ))
            }
          />
        )}
        {(!onlyShowActions || onlyShowActions.includes('REMOVE')) && (
          <Table.Column
            width={150}
            title="Action"
            dataIndex="action"
            render={(_, record: UserData) => (
              <Space size="middle">
                {handleRemoveUser && (
                  <Button
                    size="small"
                    onClick={() => {
                      users?.length === 1
                        ? message.error('There must be at least one user in a project')
                        : record.user.user_id == ownerId
                        ? message.error('Cannot remove project owner')
                        : handleRemoveUser(record.user.user_id);
                    }}
                  >
                    Remove
                  </Button>
                )}
              </Space>
            )}
          />
        )}
      </Table>
    </Space>
  );
}
