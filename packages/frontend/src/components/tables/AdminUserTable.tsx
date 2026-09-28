import React, { useState, useMemo } from 'react';
import { Table, Space, Tag, Typography } from 'antd';
import type { FilterValue } from 'antd/es/table/interface';
import dayjs from 'dayjs';
import { Role, User } from '../../api/types';
import { ADMIN_ROLE_ID, FACULTY_ROLE_ID, STUDENT_ROLE_ID } from '../../api/role';
import UserManagementModal from '../modals/UserManagementModal';
import UserDeletionModal from '../modals/UserDeletionModal';
import UserProjectsModal from '../modals/UserProjectsModal';
import AdminUserFilterPanel, { LAST_ACTIVE_NEVER, LAST_ACTIVE_BEFORE_PREFIX } from './AdminUserFilterPanel';

const ROLE_TAG_COLORS: Record<number, string> = {
  [ADMIN_ROLE_ID]: 'gold',
  [FACULTY_ROLE_ID]: 'blue',
  [STUDENT_ROLE_ID]: 'green',
};

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

const matchesRole = (user: User, value: FilterValue | null): boolean =>
  !value || value.length === 0 || value.some((v) => user.basicRoles[0]?.role_id === v);

const matchesProjects = (user: User, value: FilterValue | null): boolean =>
  !value ||
  value.length === 0 ||
  value.some((v) => user.projects?.some((userProject) => String(userProject.project_id) === String(v)));

const matchesLastActive = (user: any, value: FilterValue | null): boolean => {
  if (!value || value.length === 0) return true;
  const strValue = value[0].toString();
  const lastAccess = user.api_usages?.[0]?.timestamp;
  if (strValue === LAST_ACTIVE_NEVER) return !lastAccess;
  if (strValue.startsWith(LAST_ACTIVE_BEFORE_PREFIX)) {
    // A user who has never logged in was never active after the cutoff either.
    if (!lastAccess) return true;
    const cutoff = new Date(`${strValue.slice(LAST_ACTIVE_BEFORE_PREFIX.length)}T23:59:59.999`);
    return new Date(lastAccess) <= cutoff;
  }
  return true;
};

export default function UserTable(props: UserTableProps): JSX.Element {
  const { users, roles, isLoading, showSelect, onSelectChange, footer, pagination,} = props;

  const [columnFilters, setColumnFilters] = useState<Record<string, FilterValue | null>>({});

  const clearColumnFilter = (key: string) => setColumnFilters((prev) => ({ ...prev, [key]: null }));
  const handleFilterChange = (key: string, value: FilterValue | null) =>
    setColumnFilters((prev) => ({ ...prev, [key]: value }));

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
        const label = project ? `${project.pname} [${courseLabel}]` : `Project ID: ${userProject.project_id}`;
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

  const filteredUsers = useMemo(
    () =>
      users?.filter(
        (user) =>
          matchesRole(user, columnFilters.role ?? null) &&
          matchesProjects(user, columnFilters.projects ?? null) &&
          matchesLastActive(user, columnFilters.last_active ?? null),
      ),
    [users, columnFilters],
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
      <Space wrap style={{ marginBottom: 8 }}>
        <AdminUserFilterPanel
          roles={roles}
          projectOptions={projectFilterOptions}
          filters={columnFilters}
          onChange={handleFilterChange}
        />
        {hasActiveFilters && <Typography.Text strong>Active filters:</Typography.Text>}
        {roleChipLabel && (
          <Tag color='cyan' closable onClose={() => clearColumnFilter('role')}>
            Role: {roleChipLabel}
          </Tag>
        )}
        {projectsChipLabel && (
          <Tag color='cyan' closable onClose={() => clearColumnFilter('projects')}>
            Projects: {projectsChipLabel}
          </Tag>
        )}
        {lastActiveChipLabel && (
          <Tag color='cyan' closable onClose={() => clearColumnFilter('last_active')}>
            Last Active: {lastActiveChipLabel}
          </Tag>
        )}
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
        dataSource={filteredUsers}
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
        render={(_, record: User) => {
          const role = roles?.find((r) => r.id === record.basicRoles[0]?.role_id);
          if (!role) return '-';
          return <Tag color={ROLE_TAG_COLORS[role.id]}>{role.role_name}</Tag>;
        }}
      />

      <Table.Column width='10%'
        title='Projects'
        key='projects'
        sorter={(a: any, b: any) => (a.projects?.length || 0) - (b.projects?.length || 0)}
        render={(_, record: User) => {
          const projectCount = record.projects?.length || 0;
          const label = `${projectCount} Project${projectCount !== 1 ? 's' : ''}`;
          return <UserProjectsModal user={record} trigger={<Typography.Link underline>{label}</Typography.Link>} />;
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
            <UserManagementModal user={record} roles={roles} />
            <UserDeletionModal user={record} />
          </Space>
        )}
      />
      </Table>
    </>
  );
}
