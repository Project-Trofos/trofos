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
      <Table.Column
        width='10%'
        title='User ID'
        dataIndex='user_id'
        sorter={(a: User, b: User) => a.user_id - b.user_id}
      />
      <Table.Column
        width='20%'
        title='Name'
        dataIndex='user_display_name'
        sorter={(a: User, b: User) => a.user_display_name.localeCompare(b.user_display_name)}
      />
      <Table.Column
        width='25%'
        title='Email'
        dataIndex='user_email'
        sorter={(a: User, b: User) => a.user_email.localeCompare(b.user_email)}
      />

      <Table.Column width='10%'
        title='Projects'
        key='projects'
        sorter={(a: any, b: any) => (a.projects?.length || 0) - (b.projects?.length || 0)}
        render={(_, record: any) => {
          const projectCount = record.projects?.length || 0;
          return `${projectCount} Project${projectCount !== 1 ? 's' : ''}`;
        }}
      />

      <Table.Column
        width='15%'
        title='Last Active'
        key='last_active'
        sorter={(a: any, b: any) => {
          const aTime = a.api_usages?.[0]?.timestamp ? new Date(a.api_usages[0].timestamp).getTime() : 0;
          const bTime = b.api_usages?.[0]?.timestamp ? new Date(b.api_usages[0].timestamp).getTime() : 0;
          return aTime - bTime;
        }}
        filters={[
          { text: 'Never Logged In', value: 'never' },
          { text: 'Inactive > 3 Months', value: 'inactive_3' },
          { text: 'Inactive > 6 Months', value: 'inactive_6' },
          { text: 'Inactive > 1 Year', value: 'inactive_12' },
          { text: 'Last 24 Hours', value: 'recent_1' },
          { text: 'Last 7 Days', value: 'recent_7' },
          { text: 'Last 30 Days', value: 'recent_30' },
        ]}
        onFilter={(value, record: any) => {
          const lastAccess = record.api_usages?.[0]?.timestamp;
          if (value === 'never') return !lastAccess;
          if (!lastAccess) {
            if (value.toString().startsWith('inactive')) return true;
            if (value.toString().startsWith('recent')) return false;
            return false;
          }
          const accessDate = new Date(lastAccess);
          const cutoffDate = new Date();
          switch (value) {
            case 'inactive_3':
              cutoffDate.setMonth(cutoffDate.getMonth() - 3);
              return accessDate < cutoffDate;
            case 'inactive_6':
              cutoffDate.setMonth(cutoffDate.getMonth() - 6);
              return accessDate < cutoffDate;
            case 'inactive_12':
              cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
              return accessDate < cutoffDate;
            case 'recent_1':
              cutoffDate.setDate(cutoffDate.getDate() - 1);
              return accessDate >= cutoffDate;
            case 'recent_7':
              cutoffDate.setDate(cutoffDate.getDate() - 7);
              return accessDate >= cutoffDate;
            case 'recent_30':
              cutoffDate.setDate(cutoffDate.getDate() - 30);
              return accessDate >= cutoffDate;
            default:
              return true;
          }
        }}
        render={(_, record: any) => {
          const lastUsage = record.api_usages?.[0]?.timestamp;
          if (!lastUsage) return <span style={{ color: 'gray' }}>Never</span>;

          return new Date(lastUsage).toLocaleDateString('en-GB');
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
