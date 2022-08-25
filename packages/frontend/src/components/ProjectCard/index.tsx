import React from 'react';
import { Card, Dropdown, Menu } from 'antd';
import { Link } from 'react-router-dom';
import { EllipsisOutlined, SettingOutlined } from '@ant-design/icons';

import { removeProjectById } from '../../reducers/projectsReducer';
import { useAppDispatch } from '../../app/hooks';
import { Project } from '../../api/project';

const { Meta } = Card;

type ProjectCardProps = {
  project: Project;
};

export default function ProjectCard(props: ProjectCardProps): JSX.Element {
  const { project } = props;
  const dispatch = useAppDispatch();

  const menu = (
    <Menu
      onClick={() => dispatch(removeProjectById(project.id))}
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
        title={<Link to={`/project/${project.id}`}>{project.name}</Link>}
        description={project.description ?? 'No description'}
      />
    </Card>
  );
}
