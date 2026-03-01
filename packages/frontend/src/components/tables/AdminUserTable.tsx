import React, { useState } from 'react';
import { Table, Space } from 'antd';
import { Role, User } from '../../api/types';
import UserManagementModal from '../modals/UserManagementModal';
import UserDeletionModal from '../modals/UserDeletionModal';
import UserProjectsModal from '../modals/UserProjectsModal';

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
      <Table.Column width='15%' title='User ID' dataIndex='user_id' />
      <Table.Column width='30%' title='Email' dataIndex='user_email' />

      <Table.Column width='15%' 
        title='Projects' 
        render={(_, record: any) => {
          const projectCount = record.projects?.length || 0;
          return `${projectCount} Project${projectCount !== 1 ? 's' : ''}`;
        }} 
      />

      <Table.Column width='20%' 
        title='Last Active' 
        render={(_, record: any) => {
          const lastUsage = record.api_usages?.[0]?.timestamp;
          if (!lastUsage) return <span style={{ color: 'gray' }}>Never</span>;
          
          return new Date(lastUsage).toLocaleDateString('en-US');
        }} 
      />

      <Table.Column width='20%' 
        title="Actions"
        dataIndex="action"
        render={(_, record: User) => (
          <Space>
            <UserProjectsModal user={record} />
            <UserManagementModal user={record} roles={roles} />
            <UserDeletionModal user={record} />
          </Space>
        )}
      />
    </Table>
  );
}
