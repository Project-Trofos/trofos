import React, { useCallback } from 'react';
import { Button, Card, message, Space, Table, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { Project, useRemoveProjectMutation } from '../../api/project';
import { confirmDeleteProject, confirmDetachProject } from '../modals/confirm';
import { useRemoveProjectFromCourseMutation } from '../../api/course';
import { getErrorMessage } from '../../helpers/error';



/**
 * Table for listing projects
 */
export default function ProjectTable({ projects, isLoading }: { projects: Project[], isLoading: boolean }) {

  const [removeProject] = useRemoveProjectMutation();
  const [removeProjectFromCourse] = useRemoveProjectFromCourseMutation();

  const handleDeleteProject = useCallback((project: Project) => {
    try {
      confirmDeleteProject(async () => {
        await removeProject({ id: project.id }).unwrap();
      });
    } catch (err) {
      message.error(getErrorMessage(err));
    }
  }, [removeProject]);

  const handleRemoveProjectFromCourse = useCallback(async (project: Project) => {
    try {
      if (!project.course_id) {
        throw Error('Invalid project to be deleted!');
      }

      confirmDetachProject(async () => {
        removeProjectFromCourse({ projectId: project.id, courseId: project.course_id ?? '' }).unwrap();
      });
    } catch (err) {
      message.error(getErrorMessage(err));
    }
  }, [removeProjectFromCourse]);

  return (
    <Card>
      <Space direction='vertical' size='middle' style={{ display: 'flex' }}>
        <Typography style={{ fontSize: '2em' }}>Projects</Typography>
        <Table
          dataSource={projects}
          rowKey={(project) => project.id}
          loading={isLoading} 
          bordered
          pagination={{ pageSize: 5 }}
        >
          <Table.Column title="ID" dataIndex="id" />
          <Table.Column title="Name" dataIndex="pname" />
          <Table.Column 
            title="Action" 
            dataIndex="action" 
            render={(_, record: Project) => (
              <Space size="middle">
                <Link to={`/project/${record.id}`}>Go to</Link>
                <Button size='small' onClick={() => handleDeleteProject(record)}>Delete</Button>
                {record.course_id &&
                  <Button size='small' onClick={() => handleRemoveProjectFromCourse(record)}>
                    Detach
                  </Button>
                }
              </Space>
            )}
          />
        </Table>
      </Space>
    </Card>
  );
}