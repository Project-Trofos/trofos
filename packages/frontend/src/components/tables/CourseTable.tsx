import React from 'react';
import { Space, Table } from 'antd';
import { Link } from 'react-router-dom';
import { Course } from '../../api/types';
import { Subheading } from '../typography';

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
export default function CourseTable({ courses, isLoading, heading, control }: CourseTableProps) {
  return (
    <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
      <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Subheading>{heading ?? 'Courses'}</Subheading>
        {control}
      </Space>
      <Table
        dataSource={courses}
        rowKey={(project) => project.id}
        loading={isLoading}
        bordered
        size="small"
        pagination={{ pageSize: 5 }}
      >
        <Table.Column width={150} title="ID" dataIndex="id" sorter={(a: Course, b: Course) => a.id - b.id} />
        <Table.Column
          width={150}
          title="Code"
          dataIndex="code"
          sorter={(a: Course, b: Course) => a.code.localeCompare(b.code)}
        />
        <Table.Column
          width={150}
          title="Start Year"
          dataIndex="startYear"
          sorter={(a: Course, b: Course) => a.startYear - b.startYear}
        />
        <Table.Column
          width={150}
          title="Start Semester"
          dataIndex="startSem"
          sorter={(a: Course, b: Course) => a.startSem - b.startSem}
        />
        <Table.Column
          width={150}
          title="End Year"
          dataIndex="endYear"
          sorter={(a: Course, b: Course) => a.endYear - b.endYear}
        />
        <Table.Column
          width={150}
          title="End Semester"
          dataIndex="endSem"
          sorter={(a: Course, b: Course) => a.endSem - b.endSem}
        />
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
  );
}
