import React from 'react';
import { Space, Table } from 'antd';
import { Link } from 'react-router-dom';
import { Backlog, Project } from '../../api/types';
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
  projects?: Project[];
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
  projects,
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
        {projects ? (
          <Table.Column
            width={150}
            title="Project"
            dataIndex="project_id"
            render={(value, record, index) => {
              return projects.find((p) => p.id === record.project_id)?.pname ?? record.project_id;
            }}
            sorter={(a: Backlog, b: Backlog) => a.project_id - b.project_id}
          />
        ) : (
          <Table.Column
            width={150}
            title="Project"
            dataIndex="project_id"
            sorter={(a: Backlog, b: Backlog) => a.project_id - b.project_id}
          />
        )}
        <Table.Column
          width={150}
          title="ID"
          dataIndex="backlog_id"
          sorter={(a: Backlog, b: Backlog) => a.backlog_id - b.backlog_id}
        />
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
          width={100}
          title="Action"
          dataIndex="action"
          render={(_, record: Backlog) => (
            <Space size="middle">
              {(!onlyShowActions || onlyShowActions?.includes('GOTO')) && (
                <Link to={`project/${record.project_id}/backlog/${record.backlog_id}/`}>Go to</Link>
              )}
            </Space>
          )}
        />
      </Table>
    </Space>
  );
}
