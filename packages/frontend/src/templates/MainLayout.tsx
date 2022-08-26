import React, { useMemo } from 'react';
import { Avatar, Col, Layout, Row, MenuProps } from 'antd';
import Menu from 'antd/lib/menu';
import { BellOutlined, HomeOutlined, ProjectOutlined, QuestionCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { Link, Outlet } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import { selectProjects } from '../reducers/projectsReducer';

import './MainLayout.css';

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
  const { projects } = useAppSelector(selectProjects);

  const USERNAME = 'username';

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

  const renderHeader = () => (
    <Row justify='end' align='middle' gutter={16}>
      <Col>
        <SearchOutlined />
      </Col>
      <Col>
        <QuestionCircleOutlined />
      </Col>
      <Col>
        <BellOutlined />
      </Col>
      <Col>
        <div className='avatar-group'>
          <Avatar />
          <span>
            {USERNAME}
          </span>
        </div>
      </Col>
    </Row>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="dark" style={{ backgroundColor: '#32A2AC' }} breakpoint="lg" collapsedWidth="0">
        <div style={{ fontSize: '2rem', padding: '1rem', color: 'white' }}>Trofos</div>
        <Menu mode="inline" defaultSelectedKeys={['1']} items={menuItems} />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 16px', borderBottom: '1px solid', borderBottomColor: '#DDD' }}>
          {renderHeader()}
        </Header>
        <Content style={{ minHeight: 360 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );


}
