import React, { useMemo } from 'react';
import { Space, Table } from 'antd';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { Sprint } from '../../api/sprint';
import { Subheading } from '../typography';

import { filterDropdown } from './helper';
import { BacklogStatus, Project } from '../../api/types';

type SprintTableProps = {
  sprints: Sprint[] | undefined;
  projects: Project[] | undefined;
  isLoading?: boolean;
  heading?: string;
  control?: React.ReactNode;
};

/**
 * Table for listing sprints
 */
export default function SprintTable({ sprints, projects, isLoading, heading, control }: SprintTableProps) {
  const projectIdToName = useMemo(() => {
    const map = new Map<number, string>();
    if (!projects) {
      return map;
    }

    for (const project of projects) {
      map.set(project.id, project.pname);
    }

    return map;
  }, [projects]);

  return (
    <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
      <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Subheading>{heading ?? 'Sprints'}</Subheading>
        {control}
      </Space>
      <Table
        dataSource={sprints}
        rowKey={(project) => project.id}
        loading={isLoading}
        bordered
        size="small"
        pagination={{ pageSize: 5 }}
      >
        <Table.Column
          width={150}
          title="Project Name"
          dataIndex="name"
          filterDropdown={filterDropdown}
          render={(_, record) => projectIdToName.get(record.project_id)}
          sorter={(a: Sprint, b: Sprint) =>
            (projectIdToName.get(a.project_id) ?? '').localeCompare(projectIdToName.get(b.project_id) ?? '')
          }
          onFilter={(value, record: Sprint) =>
            (projectIdToName.get(record.project_id) ?? '').toLowerCase().includes(value.toString().toLowerCase())
          }
        />
        <Table.Column
          width={150}
          title="Sprint Name"
          dataIndex="name"
          filterDropdown={filterDropdown}
          sorter={(a: Sprint, b: Sprint) => a.name.localeCompare(b.name)}
          onFilter={(value, record: Sprint) => record.name.toLowerCase().includes(value.toString().toLowerCase())}
        />
        <Table.Column
          width={80}
          title="Start Date"
          dataIndex="start_date"
          render={(_, record) => {
            return dayjs(record.start_date).format('DD/MM/YYYY');
          }}
          sorter={(a: Sprint, b: Sprint) => dayjs(a.start_date).diff(dayjs(b.start_date))}
        />
        <Table.Column
          width={80}
          title="End Date"
          dataIndex="end_date"
          render={(_, record) => {
            return dayjs(record.end_date).format('DD/MM/YYYY');
          }}
          sorter={(a: Sprint, b: Sprint) => dayjs(a.end_date).diff(dayjs(b.end_date))}
        />
        <Table.Column
          width={80}
          title="Status"
          dataIndex="status"
          sorter={(a: Sprint, b: Sprint) => a.status.localeCompare(b.status)}
        />
        <Table.Column
          width={50}
          title="Incomplete Issues"
          render={(_, record) => {
            return record.backlogs.filter((b) => b.status !== BacklogStatus.DONE).length;
          }}
          sorter={(a: Sprint, b: Sprint) =>
            a.backlogs.filter((x) => x.status !== BacklogStatus.DONE).length -
            b.backlogs.filter((x) => x.status !== BacklogStatus.DONE).length
          }
        />
        <Table.Column
          width={80}
          title="Action"
          dataIndex="action"
          render={(_, record: Sprint) => (
            <Space size="middle">
              <Link to={`/project/${record.project_id}/board/${record.id}`}>View board</Link>
            </Space>
          )}
        />
      </Table>
    </Space>
  );
}
