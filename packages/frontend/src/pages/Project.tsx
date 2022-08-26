import React, { useMemo } from 'react';
import { Link, Outlet, useParams } from 'react-router-dom';
import { Button, Dropdown, Menu, PageHeader, Tabs } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import { useAppSelector } from '../app/hooks';
import { selectProjects } from '../reducers/projectsReducer';
import { Project } from '../api/project';

const menu = (
  <Menu
    items={[
      {
        key: '1',
        label: 'Delete project',
      },
    ]}
  />
);

function DropdownMenu() {
  return (
    <Dropdown key="more" overlay={menu} placement="bottomRight">
      <Button type="text" icon={<MoreOutlined style={{ fontSize: 20 }} />} />
    </Dropdown>
  );
}

export default function ProjectPage(): JSX.Element {
  const params = useParams();
  const projects = useAppSelector(selectProjects);
  const project: Project = useMemo(() => (
    projects.projects.filter((p) => p.id === params.projectId)[0]
  ), [projects, params.projectId]);

  const routes = [
    {
      path: '/projects',
      breadcrumbName: 'Projects',
    },
    {
      path: `/project/${project.id}`,
      breadcrumbName: project.name,
    },
  ];

  return (
    <>
      <PageHeader
        title={project.id}
        className="site-page-header"
        subTitle={project.description}
        extra={[<DropdownMenu key="more" />]}
        breadcrumb={{ routes }}
        style={{ backgroundColor: '#FFF' }}
        footer={
          <Tabs defaultActiveKey="1">
            <Tabs.TabPane tab={<Link style={{ textDecoration: 'none' }} to={`/project/${project.id}`}>Overview</Link>} key="1" />
            <Tabs.TabPane tab={<Link style={{ textDecoration: 'none' }} to={`/project/${project.id}/backlog`}>Backlog</Link>} key="2" />
            <Tabs.TabPane tab={<Link style={{ textDecoration: 'none' }} to={`/project/${project.id}/kanban`}>Kanban</Link>} key="3" />
          </Tabs>
        }
      />
      <section>
        <Outlet />
      </section>
    </>
  );
}
