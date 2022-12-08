import React, { useCallback } from 'react';
import { Button, Card, message, Space, Table } from 'antd';
import { Link } from 'react-router-dom';
import { useRemoveProjectMutation } from '../../api/project';
import { confirmDeleteProject, confirmDetachProject } from '../modals/confirm';
import { useRemoveProjectFromCourseMutation } from '../../api/course';
import { getErrorMessage } from '../../helpers/error';
import { Project } from '../../api/types';
import { Subheading } from '../typography';

import './ProjectTable.css';
import { filterDropdown } from './helper';

type ProjectTableProps = {
  projects: Project[] | undefined;
  isLoading: boolean;
  heading?: string;
  control?: React.ReactNode;
  showCourseColumn?: boolean;
};

/**
 * Table for listing projects
 */
export default function ProjectTable({ projects, isLoading, heading, control, showCourseColumn }: ProjectTableProps) {
  const [removeProject] = useRemoveProjectMutation();
  const [removeProjectFromCourse] = useRemoveProjectFromCourseMutation();

  const handleDeleteProject = useCallback(
    (project: Project) => {
      try {
        confirmDeleteProject(async () => {
          await removeProject({ id: project.id }).unwrap();
        });
      } catch (err) {
        message.error(getErrorMessage(err));
      }
    },
    [removeProject],
  );

  const handleRemoveProjectFromCourse = useCallback(
    async (project: Project) => {
      try {
        if (!project.course_id) {
          throw Error('Invalid project to be deleted!');
        }

        confirmDetachProject(async () => {
          removeProjectFromCourse({
            projectId: project.id,
            courseId: project.course_id as number,
          }).unwrap();
        });
      } catch (err) {
        message.error(getErrorMessage(err));
      }
    },
    [removeProjectFromCourse],
  );

  return (
    <Card className="table-card">
      <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
        <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Subheading>{heading ?? 'Projects'}</Subheading>
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
          <Table.Column width={150} title="ID" dataIndex="id" sorter={(a: Project, b: Project) => a.id - b.id} />
          <Table.Column
            title="Name"
            dataIndex="pname"
            filterDropdown={filterDropdown}
            sorter={(a: Project, b: Project) => a.pname.localeCompare(b.pname)}
            onFilter={(value, record: Project) => record.pname.toLowerCase().includes(value.toString().toLowerCase())}
          />
          {showCourseColumn && (
            <>
              <Table.Column
                title="Course"
                dataIndex={['course', 'cname']}
                sorter={(a: Project, b: Project) => (a.course?.cname ?? '').localeCompare(b.course?.cname ?? '')}
              />
              <Table.Column
                title="Course ID"
                dataIndex={['course_id']}
                sorter={(a: Project, b: Project) => (a.course?.cname ?? '').localeCompare(b.course?.cname ?? '')}
              />
            </>
          )}
          <Table.Column
            width={300}
            title="Action"
            dataIndex="action"
            render={(_, record: Project) => (
              <Space size="middle">
                <Link to={`/project/${record.id}/overview`}>Go to</Link>
                <Button size="small" onClick={() => handleDeleteProject(record)}>
                  Delete
                </Button>
                {record.course_id && (
                  <Button size="small" onClick={() => handleRemoveProjectFromCourse(record)}>
                    Detach
                  </Button>
                )}
              </Space>
            )}
          />
        </Table>
      </Space>
    </Card>
  );
}
