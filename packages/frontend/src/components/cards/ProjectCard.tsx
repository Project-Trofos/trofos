import React from 'react';
import { Card, Dropdown, Menu, message } from 'antd';
import { Link } from 'react-router-dom';
import { EllipsisOutlined, SettingOutlined } from '@ant-design/icons';

import { Project, useRemoveProjectMutation } from '../../api/project';
import { confirmDeleteProject } from '../modals/confirm';


const { Meta } = Card;

type ProjectCardProps = {
  project: Project;
};

export default function ProjectCard(props: ProjectCardProps): JSX.Element {
  const { project } = props;
  const [removeProject] = useRemoveProjectMutation();

  const menu = (
    <Menu
      onClick={() => confirmDeleteProject(() => removeProject({ id: project.id }).catch(message.error))}
      items={[
        {
          label: 'delete',
          key: '0',
        },
      ]}
    />
  );

  return (
    <Card
      style={{ width: 300 }}
      actions={[
        <SettingOutlined key="setting" />,
        <Dropdown overlay={menu} trigger={['click']}>
          <EllipsisOutlined key="more" />
        </Dropdown>,
      ]}
    >
      <Meta
        title={<Link to={`/project/${project.id}`}>{project.pname}</Link>}
        description={project.description ?? 'No description'}
      />
    </Card>
  );
}
