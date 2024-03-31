import React, { useCallback, useState } from 'react';
import { Card, Dropdown, Menu, message, MenuProps } from 'antd';
import { Link } from 'react-router-dom';
import { EllipsisOutlined, SettingOutlined } from '@ant-design/icons';

import { useRemoveProjectMutation, useArchiveProjectMutation, useUnarchiveProjectMutation } from '../../api/project';
import { confirmDeleteProject, confirmArchiveProject, confirmUnarchiveProject } from '../modals/confirm';
import { getErrorMessage } from '../../helpers/error';
import { Project } from '../../api/types';

import './ProjectCard.css';

const { Meta } = Card;

type ProjectCardProps = {
  project: Project;
};

export default function ProjectCard(props: ProjectCardProps): JSX.Element {
  const { project } = props;
  const [removeProject] = useRemoveProjectMutation();
  const [archiveProject] = useArchiveProjectMutation();
  const [unarchiveProject] = useUnarchiveProjectMutation();
  useState;

  const handleOnDelete = useCallback(() => {
    try {
      confirmDeleteProject(async () => {
        await removeProject({ id: project.id }).unwrap();
      });
    } catch (err) {
      message.error(getErrorMessage(err));
    }
  }, [removeProject, archiveProject, unarchiveProject, project.id]);

  const handleOnArchive = useCallback(() => {
    try {
      confirmArchiveProject(async () => {
        await archiveProject({ id: project.id }).unwrap();
      });
    } catch (err) {
      message.error(getErrorMessage(err));
    }
  }, [removeProject, archiveProject, unarchiveProject, project.id]);

  const handleOnUnarchive = useCallback(() => {
    try {
      confirmUnarchiveProject(async () => {
        await unarchiveProject({ id: project.id }).unwrap();
      });
    } catch (err) {
      message.error(getErrorMessage(err));
    }
  }, [removeProject, archiveProject, unarchiveProject, project.id]);

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    if (e.key === 'delete') {
      handleOnDelete();
    }
    if (e.key === 'archive') {
      handleOnArchive();
    }
    if (e.key === 'unarchive') {
      handleOnUnarchive();
    }
  };

  const items: MenuProps['items'] = [
    {
      label: 'delete',
      key: 'delete',
    },
    project?.is_archive
      ? {
          label: 'unarchive',
          key: 'unarchive',
        }
      : {
          label: 'archive',
          key: 'archive',
        },
  ];

  const menu = { items, onClick: handleMenuClick };

  return (
    <Card
      className="project-card"
      actions={[
        <Link to={`/project/${project.id}/settings`}>
          <SettingOutlined key="setting" />
        </Link>,
        <Dropdown menu={menu} trigger={['click']}>
          <EllipsisOutlined key="more" />
        </Dropdown>,
      ]}
    >
      <Meta
        title={<Link to={`/project/${project.id}/overview`}>{project.pname}</Link>}
        description={project.description ?? 'No description'}
      />
    </Card>
  );
}
