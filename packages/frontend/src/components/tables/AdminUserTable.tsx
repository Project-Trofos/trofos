import React, { useState } from 'react';
import { Table } from 'antd';
import { Role, User } from '../../api/types';
import UserManagementModal from '../modals/UserManagementModal';

type UserTableProps = {
  users: User[] | undefined;
  roles: Role[] | undefined;

  isLoading?: boolean;
  showSelect?: boolean;
  onSelectChange?: (selectedKeys: React.Key[]) => void;
  footer?: string;
  pagination?: false;
};

export default function UserTable(props: UserTableProps): JSX.Element {
  const { users, roles, isLoading, showSelect, onSelectChange, footer, pagination,} = props;

  return (
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
      rowKey={(user) => user.user_id}
      loading={isLoading}
      bordered
      size="small"
      footer={footer ? () => footer : undefined}
      pagination={pagination}
    >
      <Table.Column width={300} title="User ID" dataIndex="user_id" />
      <Table.Column width={300} title="Email" dataIndex="user_email" />
      <Table.Column
        title="Actions"
        dataIndex="action"
        render={(_, record: User) => <UserManagementModal user={record} roles={roles} />}
      />
    </Table>
  );
}
