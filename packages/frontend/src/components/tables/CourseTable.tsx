import React from 'react';
import { Card, Space, Table } from 'antd';
import { Link } from 'react-router-dom';
import { Course } from '../../api/types';
import { Subheading } from '../typography';

import './ProjectTable.css';
import { filterDropdown } from './helper';

type CourseTableProps = {
  courses: Course[] | undefined;
  isLoading: boolean;
  heading?: string;
  control?: React.ReactNode;
};

/**
 * Table for listing projects
 */
export default function CourseTable({ courses: projects, isLoading, heading, control }: CourseTableProps) {
  return (
    <Card className="table-card">
      <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
        <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Subheading>{heading ?? 'Courses'}</Subheading>
          {control}
        </Space>
        <Table
          dataSource={projects}
          rowKey={(project) => project.id}
          loading={isLoading}
          bordered
          size="small"
          pagination={{ pageSize: 5 }}
        >
          <Table.Column
            width={150}
            title="ID"
            dataIndex="id"
            sorter={(a: Course, b: Course) => a.id.localeCompare(b.id)}
          />
          <Table.Column width={150} title="Year" dataIndex="year" sorter={(a: Course, b: Course) => a.year - b.year} />
          <Table.Column width={150} title="Semester" dataIndex="sem" sorter={(a: Course, b: Course) => a.sem - b.sem} />
          <Table.Column
            title="Name"
            dataIndex="cname"
            filterDropdown={filterDropdown}
            sorter={(a: Course, b: Course) => a.cname.localeCompare(b.cname)}
            onFilter={(value, record: Course) => record.cname.toLowerCase().includes(value.toString().toLowerCase())}
          />
          <Table.Column
            width={150}
            title="Action"
            dataIndex="action"
            render={(_, record: Course) => (
              <Space size="middle">
                <Link to={`/course/${record.id}/overview`}>Go to</Link>
              </Space>
            )}
          />
        </Table>
      </Space>
    </Card>
  );
}
