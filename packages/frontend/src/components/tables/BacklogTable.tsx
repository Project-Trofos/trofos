import React from 'react';
import { Space, Table } from 'antd';
import { Link } from 'react-router-dom';
import { Backlog, Project, UserData } from '../../api/types';
import { Subheading } from '../typography';

import { filterDropdown } from './helper';
import BacklogCardPriority from '../dropdowns/BacklogCardPriority';
import compareBacklogPriority from '../../helpers/compareBacklogPriority';

type BacklogTableProps = {
  backlogs: Backlog[] | undefined;
  isLoading?: boolean;
  heading?: string;
  control?: React.ReactNode;
  onlyShowActions?: ('GOTO' | 'DELETE' | 'DETACH')[];
  removeRows?: ('Project' | 'Assignee')[];
  projects?: Project[];
  users?: UserData[];
};

/**
 * Table for listing backlogs
 */
export default function BacklogTable({
  backlogs,
  isLoading,
  heading,
  control,
  onlyShowActions,
  removeRows,
  projects,
  users,
}: BacklogTableProps) {
  return (
    <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
      <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Subheading>{heading ?? 'Backlogs'}</Subheading>
        {control}
      </Space>
      <Table
        dataSource={backlogs}
        rowKey={(backlog) => `${backlog.project_id}/${backlog.backlog_id}`}
        loading={isLoading}
        bordered
        size="small"
        pagination={{ pageSize: 5 }}
      >
        {(!removeRows || !removeRows.includes('Project')) && (
          <Table.Column
            width={150}
            title="Project"
            dataIndex="project_id"
            render={(value, record, index) => {
              return projects?.find((p) => p.id === record.project_id)?.pname ?? record.project_id;
            }}
            sorter={(a: Backlog, b: Backlog) => a.project_id - b.project_id}
          />
        )}
        <Table.Column
          width={100}
          title="Issue ID"
          dataIndex="backlog_id"
          sorter={(a: Backlog, b: Backlog) => a.backlog_id - b.backlog_id}
        />

        {(!removeRows || !removeRows.includes('Assignee')) && (
          <Table.Column
            width={150}
            title="Assignee"
            dataIndex="assignee_id"
            render={(value, record, index) => {
              return (
                users?.find((u) => u.user.user_id === record.assignee_id)?.user.user_display_name ?? record.assignee_id
              );
            }}
            sorter={(a: Backlog, b: Backlog) => (a.assignee_id ?? 0) - (b.assignee_id ?? 0)}
            filterDropdown={filterDropdown}
            onFilter={(value, record: Backlog) =>
              (users?.find((u) => u.user.user_id === record.assignee_id)?.user.user_display_name ?? record.assignee_id)
                ?.toString()
                .toLowerCase()
                .includes(value.toString().toLowerCase()) ?? false
            }
          />
        )}
        <Table.Column
          title="Summary"
          dataIndex="summary"
          filterDropdown={filterDropdown}
          sorter={(a: Backlog, b: Backlog) => a.summary.localeCompare(b.summary)}
          onFilter={(value, record: Backlog) => record.summary.toLowerCase().includes(value.toString().toLowerCase())}
        />
        <Table.Column
          title="Priority"
          width={100}
          dataIndex="priority"
          render={(value, record, index) => {
            return (
              <BacklogCardPriority
                backlogId={record.backlog_id}
                currentPriority={record.priority}
                projectId={record.project_id}
                editable={false}
              />
            );
          }}
          sorter={(a: Backlog, b: Backlog) => compareBacklogPriority(a.priority, b.priority)}
        />
        <Table.Column
          width={50}
          title="Points"
          dataIndex="points"
          sorter={(a: Backlog, b: Backlog) => (a.points ?? 0) - (b.points ?? 0)}
        />
        <Table.Column
          width={100}
          title="Status"
          dataIndex="status"
          filterDropdown={filterDropdown}
          sorter={(a: Backlog, b: Backlog) => a.status.localeCompare(b.status)}
          onFilter={(value, record: Backlog) => record.status.toLowerCase().includes(value.toString().toLowerCase())}
        />
        <Table.Column
          width={100}
          title="Action"
          dataIndex="action"
          render={(_, record: Backlog) => (
            <Space size="middle">
              {(!onlyShowActions || onlyShowActions?.includes('GOTO')) && (
                <Link to={`/project/${record.project_id}/backlog/${record.backlog_id}/`}>Go to</Link>
              )}
            </Space>
          )}
        />
      </Table>
    </Space>
  );
}
