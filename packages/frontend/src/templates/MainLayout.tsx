import React, { useMemo } from 'react';
import { Avatar, Col, Layout, Row, MenuProps, Button } from 'antd';
import Menu from 'antd/lib/menu';
import {
  BellOutlined,
  BookOutlined,
  HomeOutlined,
  ProjectOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import './MainLayout.css';
import { useCurrentAndPastProjects } from '../api/project';
import { useCurrentAndPastCourses } from '../api/course';
import { useLogoutUserMutation, useGetUserInfoQuery } from '../api/auth';
import trofosApiSlice from '../api/index';

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
  const { currentProjects: projects } = useCurrentAndPastProjects();
  const { currentCourses: courses } = useCurrentAndPastCourses();

  const location = useLocation();
  const navigate = useNavigate();

  // Temporary until we implement a proper user auth/info flow

  const dispatch = useDispatch();

  const { data: userInfo } = useGetUserInfoQuery();
  const [logoutUser] = useLogoutUserMutation();

  const LogoutComponent = (
    <Button
      onClick={() => {
        logoutUser();
        dispatch(trofosApiSlice.util.resetApiState());
        navigate('/');
      }}
    >
      Log Out
    </Button>
  );

  const AuthComponent = !userInfo ? <Link to="/login">Log in</Link> : LogoutComponent;

  // End of temporary section

  const menuItems: MenuItem[] = useMemo(
    () => [
      getItem(<Link to="/">Home</Link>, '/', <HomeOutlined />),
      userInfo?.userRole === 1
        ? getItem(
            <Link onClick={(e) => e.stopPropagation()} to="/courses">
              Courses
            </Link>,
            '/courses',
            <BookOutlined />,
            courses === undefined || courses.length === 0
              ? undefined
              : courses.map((course) =>
                  getItem(<Link to={`/course/${course.id}`}>{course.cname}</Link>, `/course/${course.id}`),
                ),
          )
        : null,
      userInfo
        ? getItem(
            <Link onClick={(e) => e.stopPropagation()} to="/projects">
              Project
            </Link>,
            '/projects',
            <ProjectOutlined />,
            projects === undefined || projects.length === 0
              ? undefined
              : projects.map((project) =>
                  getItem(<Link to={`/project/${project.id}`}>{project.pname}</Link>, `/project/${project.id}`),
                ),
          )
        : null,
    ],
    [projects, courses, userInfo],
  );

  const renderHeader = () => (
    <Row justify="end" align="middle" gutter={16}>
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
        <div className="avatar-group">
          <Avatar />
          <span>{AuthComponent}</span>
        </div>
      </Col>
    </Row>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth="0" className="main-layout-sider">
        <div style={{ fontSize: '2rem', padding: '1rem', color: 'white' }}>Trofos</div>
        <Menu mode="inline" selectedKeys={[location.pathname]} items={menuItems} />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 16px', borderBottom: '1px solid', borderBottomColor: '#DDD' }}>
          {renderHeader()}
        </Header>
        <Content style={{ minHeight: 360, display: 'flex', flexDirection: 'column' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
