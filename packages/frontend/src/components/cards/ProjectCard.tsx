import React, { useCallback } from 'react';
import { Card, Dropdown, Menu, message } from 'antd';
import { Link } from 'react-router-dom';
import { EllipsisOutlined, SettingOutlined } from '@ant-design/icons';

import { Project, useRemoveProjectMutation } from '../../api/project';
import { confirmDeleteProject } from '../modals/confirm';
import { getErrorMessage } from '../../helpers/error';

const { Meta } = Card;

type ProjectCardProps = {
  project: Project;
};

export default function ProjectCard(props: ProjectCardProps): JSX.Element {
  const { project } = props;
  const [removeProject] = useRemoveProjectMutation();

  const handleOnClick = useCallback(() => {
    try {
      confirmDeleteProject(async () => {
        await removeProject({ id: project.id }).unwrap();
      });
    } catch (err) {
      message.error(getErrorMessage(err));
    }
  }, [removeProject, project.id]);

  const menu = (
    <Menu
      onClick={handleOnClick}
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
