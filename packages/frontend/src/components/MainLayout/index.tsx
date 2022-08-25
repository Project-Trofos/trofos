import React, { useMemo, useState } from 'react';
import { Layout } from 'antd';
import Menu from 'antd/lib/menu';
import type { MenuProps } from 'antd';
import { HomeOutlined, ProjectOutlined } from '@ant-design/icons';
import { Link, Outlet } from 'react-router-dom';
import { getProjects, Project } from '../../api/project';

const { Header, Sider, Content } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

/**
 * Get a menu items for Menu component
 */
function getItem(label: React.ReactNode, key: React.Key, icon?: React.ReactNode, children?: MenuItem[]): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  };
}

/**
 * Main layout of the application.
 */
export default function MainLayout() {
  const [projects] = useState<Project[]>(() => getProjects());

  const menuItems: MenuItem[] = useMemo(
    () => [
      getItem(<Link to="/">Home</Link>, 'sidebar-home', <HomeOutlined />),
      getItem(
        <Link to="/projects">Project</Link>,
        'sidebar-project',
        <ProjectOutlined />,
        projects.length === 0
          ? undefined
          : projects.map((project) =>
            getItem(<Link to={`/project/${project.id}`}>{project.name}</Link>, `project-${project.id}`),
          ),
      ),
    ],
    [projects],
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="dark" style={{ backgroundColor: '#32A2AC' }} breakpoint="lg" collapsedWidth="0">
        <div style={{ fontSize: '2rem', padding: '1rem', color: 'white' }}>Trofos</div>
        <Menu mode="inline" defaultSelectedKeys={['1']} items={menuItems} />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: 0 }} />
        <Content style={{ margin: '24px 16px 0' }}>
          <div style={{ padding: 24, minHeight: 360 }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
