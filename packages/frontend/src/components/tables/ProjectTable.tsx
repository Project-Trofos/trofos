import React, { useMemo } from 'react';
import { Button, Card, message, Space, Table, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { Project, useRemoveProjectMutation } from '../../api/project';
import { confirmDeleteProject, confirmDetachProject } from '../modals/confirm';
import { useRemoveProjectFromCourseMutation } from '../../api/course';



/**
 * Table for listing projects
 */
export default function ProjectTable({ projects, isLoading }: { projects: Project[], isLoading: boolean }) {

  const [removeProject] = useRemoveProjectMutation();
  const [removeProjectFromCourse] = useRemoveProjectFromCourseMutation();

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
                <Button size='small' onClick={() => confirmDeleteProject(() => removeProject({ id: record.id }).catch(message.error))}>Delete</Button>
                {record.course_id &&
                  <Button size='small' onClick={
                    () => confirmDetachProject(() => removeProjectFromCourse({ courseId: record.course_id ?? '', projectId: record.id }).catch(message.error))
                  }>
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