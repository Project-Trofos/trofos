import React, { useCallback } from 'react';
import { Button, message, Space, Table } from 'antd';
import { Link } from 'react-router-dom';
import { useRemoveProjectMutation } from '../../api/project';
import { confirmDeleteProject, confirmDetachProject } from '../modals/confirm';
import { useRemoveProjectFromCourseMutation } from '../../api/course';
import { getErrorMessage } from '../../helpers/error';
import { Project } from '../../api/types';
import { Subheading } from '../typography';

import { filterDropdown } from './helper';

type ProjectTableProps = {
  projects: Project[] | undefined;
  isLoading?: boolean;
  heading?: string;
  control?: React.ReactNode;
  showCourseColumn?: boolean;
  onlyShowActions?: ('GOTO' | 'DELETE' | 'DETACH')[];
  disableClickEvent?: boolean;
};

/**
 * Table for listing projects
 */
export default function ProjectTable({
  projects,
  isLoading,
  heading,
  control,
  showCourseColumn,
  onlyShowActions,
  disableClickEvent,
}: ProjectTableProps) {
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
        <Table.Column width={50} title="ID" dataIndex="id" sorter={(a: Project, b: Project) => a.id - b.id} />
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
          width={200}
          title="Action"
          dataIndex="action"
          render={(_, record: Project) => (
            <Space size="middle">
              {(!onlyShowActions || onlyShowActions?.includes('GOTO')) && (
                <Link to={disableClickEvent ? '' : `/project/${record.id}/overview`}>Go to</Link>
              )}
              {(!onlyShowActions || onlyShowActions?.includes('DELETE')) && (
                <Button size="small" onClick={disableClickEvent ? undefined : () => handleDeleteProject(record)}>
                  Delete
                </Button>
              )}
              {(!onlyShowActions || onlyShowActions?.includes('DELETE')) && record.course_id && (
                <Button
                  size="small"
                  onClick={disableClickEvent ? undefined : () => handleRemoveProjectFromCourse(record)}
                >
                  Detach
                </Button>
              )}
            </Space>
          )}
        />
      </Table>
    </Space>
  );
}
