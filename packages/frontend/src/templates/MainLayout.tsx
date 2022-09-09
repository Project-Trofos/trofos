import React, { useMemo } from 'react';
import { Avatar, Col, Layout, Row, MenuProps } from 'antd';
import Menu from 'antd/lib/menu';
import { BellOutlined, BookOutlined, HomeOutlined, ProjectOutlined, QuestionCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { Link, Outlet } from 'react-router-dom';

import './MainLayout.css';
import { useGetAllProjectsQuery } from '../api/project';
import { useGetAllCoursesQuery } from '../api/course';

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
  const { data: projects } = useGetAllProjectsQuery();
  const { data: courses } = useGetAllCoursesQuery();

  const USERNAME = 'username';

  const menuItems: MenuItem[] = useMemo(
    () => [
      getItem(<Link to="/">Home</Link>, 'sidebar-home', <HomeOutlined />),
      getItem(
        <Link to="/courses">Courses</Link>,
        'sidebar-course',
        <BookOutlined />,
        (courses === undefined || courses.length === 0)
          ? undefined
          : courses.map((course) =>
            getItem(<Link to={`/course/${course.id}`}>{course.cname}</Link>, `course-${course.id}`),
          ),
      ),
      getItem(
        <Link to="/projects">Project</Link>,
        'sidebar-project',
        <ProjectOutlined />,
        (projects === undefined || projects.length === 0)
          ? undefined
          : projects.map((project) =>
            getItem(<Link to={`/project/${project.id}`}>{project.pname}</Link>, `project-${project.id}`),
          ),
      ),
    ],
    [projects, courses],
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
      <Sider breakpoint="lg" collapsedWidth="0">
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
