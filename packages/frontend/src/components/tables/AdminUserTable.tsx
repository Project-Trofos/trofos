import React, { useState, useMemo } from 'react';
import { Table, Space, Checkbox, DatePicker, Button, Divider, Typography, Tag } from 'antd';
import type { FilterValue } from 'antd/es/table/interface';
import dayjs from 'dayjs';
import { Role, User } from '../../api/types';
import UserManagementModal from '../modals/UserManagementModal';
import UserDeletionModal from '../modals/UserDeletionModal';
import UserProjectsModal from '../modals/UserProjectsModal';

const LAST_ACTIVE_NEVER = 'never';
const LAST_ACTIVE_BEFORE_PREFIX = 'before:';

type UserTableProps = {
  users: User[] | undefined;
  roles: Role[] | undefined;

  isLoading?: boolean;
  showSelect?: boolean;
  onSelectChange?: (selectedKeys: React.Key[]) => void;
  footer?: string;
  pagination?: false;
};

const formatCutoffDate = (dateStr: string) => dayjs(dateStr).format('DD/MM/YYYY');

export default function UserTable(props: UserTableProps): JSX.Element {
  const { users, roles, isLoading, showSelect, onSelectChange, footer, pagination,} = props;

  const [columnFilters, setColumnFilters] = useState<Record<string, FilterValue | null>>({});

  const clearColumnFilter = (key: string) => setColumnFilters((prev) => ({ ...prev, [key]: null }));

  const projectFilterOptions = useMemo(() => {
    const byId = new Map<number, { label: string; courseLabel: string; name: string }>();
    users?.forEach((user) => {
      user.projects?.forEach((userProject) => {
        if (byId.has(userProject.project_id)) return;
        const project = userProject.project;
        // "Independent" projects still have a course row under the hood (an
        // auto-generated shadow course with a random-UUID code) - treat those
        // the same as having no course at all.
        const courseLabel =
          project?.course && !project.course.shadow_course
            ? project.course.code || project.course.cname
            : 'Independent';
        const label = project ? `${project.pname} — ${courseLabel}` : `Project ID: ${userProject.project_id}`;
        byId.set(userProject.project_id, { label, courseLabel, name: project?.pname || label });
      });
    });
    return Array.from(byId.entries())
      .sort(([, a], [, b]) => a.courseLabel.localeCompare(b.courseLabel) || a.name.localeCompare(b.name))
      .map(([id, { label }]) => ({ text: label, value: id }));
  }, [users]);

  const projectLabelById = useMemo(
    () => new Map(projectFilterOptions.map((option) => [option.value, option.text])),
    [projectFilterOptions],
  );

  const roleChipLabel = columnFilters.role
    ?.map((value) => roles?.find((r) => r.id === value)?.role_name || value)
    .join(', ');

  const projectsChipLabel = columnFilters.projects
    ?.map((value) => projectLabelById.get(value as number) || value)
    .join(', ');

  const lastActiveValue = columnFilters.last_active?.[0]?.toString();
  const lastActiveChipLabel =
    lastActiveValue === LAST_ACTIVE_NEVER
      ? 'Never Logged In'
      : lastActiveValue?.startsWith(LAST_ACTIVE_BEFORE_PREFIX)
      ? `on or before ${formatCutoffDate(lastActiveValue.slice(LAST_ACTIVE_BEFORE_PREFIX.length))}`
      : undefined;

  const hasActiveFilters = !!(roleChipLabel || projectsChipLabel || lastActiveChipLabel);

  return (
    <>
      {hasActiveFilters && (
        <Space wrap style={{ marginBottom: 8 }}>
          <Typography.Text strong>Active filters:</Typography.Text>
          {roleChipLabel && (
            <Tag closable onClose={() => clearColumnFilter('role')}>
              Role: {roleChipLabel}
            </Tag>
          )}
          {projectsChipLabel && (
            <Tag closable onClose={() => clearColumnFilter('projects')}>
              Projects: {projectsChipLabel}
            </Tag>
          )}
          {lastActiveChipLabel && (
            <Tag closable onClose={() => clearColumnFilter('last_active')}>
              Last Active: {lastActiveChipLabel}
            </Tag>
          )}
        </Space>
      )}
      <Table
        onChange={(_pagination, tableFilters) => setColumnFilters(tableFilters)}
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

      <Table.Column
        width='10%'
        title='Role'
        key='role'
        sorter={(a: User, b: User) => {
          const roleName = (user: User) => roles?.find((r) => r.id === user.basicRoles[0]?.role_id)?.role_name || '';
          return roleName(a).localeCompare(roleName(b));
        }}
        filters={roles?.map((role) => ({ text: role.role_name, value: role.id }))}
        filteredValue={columnFilters.role ?? null}
        onFilter={(value, record: User) => record.basicRoles[0]?.role_id === value}
        render={(_, record: User) => roles?.find((r) => r.id === record.basicRoles[0]?.role_id)?.role_name || '-'}
      />

      <Table.Column width='10%'
        title='Projects'
        key='projects'
        sorter={(a: any, b: any) => (a.projects?.length || 0) - (b.projects?.length || 0)}
        filters={projectFilterOptions}
        filterSearch
        filteredValue={columnFilters.projects ?? null}
        onFilter={(value, record: User) => record.projects?.some((userProject) => userProject.project_id === value) ?? false}
        render={(_, record: any) => {
          const projectCount = record.projects?.length || 0;
          return `${projectCount} Project${projectCount !== 1 ? 's' : ''}`;
        }}
      />

      <Table.Column
        width='15%'
        title='Last Active'
        key='last_active'
        defaultSortOrder='descend'
        sorter={(a: any, b: any) => {
          const aTime = a.api_usages?.[0]?.timestamp ? new Date(a.api_usages[0].timestamp).getTime() : 0;
          const bTime = b.api_usages?.[0]?.timestamp ? new Date(b.api_usages[0].timestamp).getTime() : 0;
          return aTime - bTime;
        }}
        filteredValue={columnFilters.last_active ?? null}
        filterDropdown={({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
          const current = selectedKeys[0]?.toString();
          const isNever = current === LAST_ACTIVE_NEVER;
          const dateValue =
            current && current.startsWith(LAST_ACTIVE_BEFORE_PREFIX)
              ? current.slice(LAST_ACTIVE_BEFORE_PREFIX.length)
              : undefined;

          const applyDate = (dateStr: string | undefined) => {
            setSelectedKeys(dateStr ? [`${LAST_ACTIVE_BEFORE_PREFIX}${dateStr}`] : []);
          };

          const applyPreset = (monthsAgo: number) => {
            applyDate(dayjs().subtract(monthsAgo, 'month').format('YYYY-MM-DD'));
          };

          return (
            <div style={{ padding: 8, width: 260 }}>
              <Checkbox
                checked={isNever}
                onChange={(e) => setSelectedKeys(e.target.checked ? [LAST_ACTIVE_NEVER] : [])}
              >
                Never Logged In
              </Checkbox>
              <Divider style={{ margin: '8px 0' }} />
              <Typography.Text style={{ display: 'block', marginBottom: 4 }}>
                Last active on or before:
              </Typography.Text>
              <DatePicker
                style={{ width: '100%', marginBottom: 8 }}
                disabled={isNever}
                placeholder='Select date'
                value={dateValue ? dayjs(dateValue) : null}
                onChange={(date) => applyDate(date ? date.format('YYYY-MM-DD') : undefined)}
              />
              <Space wrap style={{ marginBottom: 8 }}>
                <Button size='small' disabled={isNever} onClick={() => applyPreset(3)}>
                  3 Months Ago
                </Button>
                <Button size='small' disabled={isNever} onClick={() => applyPreset(6)}>
                  6 Months Ago
                </Button>
                <Button size='small' disabled={isNever} onClick={() => applyPreset(12)}>
                  1 Year Ago
                </Button>
              </Space>
              <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  size='small'
                  onClick={() => {
                    clearFilters?.();
                    confirm();
                  }}
                >
                  Reset
                </Button>
                <Button type='primary' size='small' onClick={() => confirm()}>
                  OK
                </Button>
              </Space>
            </div>
          );
        }}
        onFilter={(value, record: any) => {
          const strValue = value.toString();
          const lastAccess = record.api_usages?.[0]?.timestamp;
          if (strValue === LAST_ACTIVE_NEVER) return !lastAccess;
          if (strValue.startsWith(LAST_ACTIVE_BEFORE_PREFIX)) {
            // A user who has never logged in was never active after the cutoff either.
            if (!lastAccess) return true;
            const cutoffDateStr = strValue.slice(LAST_ACTIVE_BEFORE_PREFIX.length);
            const cutoff = new Date(`${cutoffDateStr}T23:59:59.999`);
            return new Date(lastAccess) <= cutoff;
          }
          return true;
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
    </>
  );
}
