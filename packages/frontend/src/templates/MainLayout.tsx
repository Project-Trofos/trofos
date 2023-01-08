import React, { useEffect, useMemo, useState } from 'react';
import { Avatar, Col, Layout, Row, MenuProps, Dropdown, Menu, Typography, Spin } from 'antd';
import {
  BellOutlined,
  BookOutlined,
  HomeOutlined,
  ProjectOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import './MainLayout.css';
import { useCurrentAndPastCourses, useCurrentAndPastProjects } from '../api/hooks';
import { useLogoutUserMutation, useGetUserInfoQuery } from '../api/auth';
import trofosApiSlice from '../api/index';
import GlobalSearch from '../components/search/GlobalSearch';
import { UserPermissionActions } from '../helpers/constants';
import conditionalRender from '../helpers/conditionalRender';

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

  const { data: userInfo, isLoading } = useGetUserInfoQuery();
  const [logoutUser] = useLogoutUserMutation();

  useEffect(() => {
    if (!isLoading && !userInfo && location.pathname !== '/') {
      navigate('/');
    }
  }, [userInfo, location, navigate, isLoading]);

  const LogoutComponent = (
    <Typography.Link
      onClick={() => {
        logoutUser();
        dispatch(trofosApiSlice.util.resetApiState());
        navigate('/');
      }}
    >
      Log Out
    </Typography.Link>
  );

  // End of temporary section

  const selectedKeys = useMemo(() => {
    // Check if a course is selected
    if (location.pathname.split('/', 2)[1] === 'course') {
      return [location.pathname.split('/', 5).join('/')];
    }
    return [location.pathname.split('/', 3).join('/')];
  }, [location.pathname]);

  // True if onOpenChanged is trying to close submenu
  const [isClosingSubMenu, setIsClosingSubMenu] = useState(false);
  const openKeys = useMemo(() => {
    const precedingPath = location.pathname.split('/', 2).join('/');
    if (isClosingSubMenu) {
      return [];
    }
    if (precedingPath === '/course' || precedingPath === '/project') {
      return [`${precedingPath}s`];
    }
    return [precedingPath];
  }, [location.pathname, isClosingSubMenu]);

  const onOpenChanged = (keys: string[]) => {
    // The latest open key is one that isn't in the opened keys
    const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
    if (latestOpenKey) {
      setIsClosingSubMenu(false);
      navigate(latestOpenKey);
    } else {
      setIsClosingSubMenu(true);
    }
  };

  const accountMenuItems = [
    {
      key: 'account',
      label: (
        <Typography.Link
          onClick={() => {
            navigate('/account');
          }}
        >
          Account
        </Typography.Link>
      ),
    },
    {
      key: 'logout',
      label: LogoutComponent,
    },
  ];

  const menuItems: MenuItem[] = useMemo(
    () => [
      getItem(<Link to="/">Home</Link>, '/', <HomeOutlined />),
      conditionalRender(
        getItem(
          <Link onClick={(e) => e.stopPropagation()} to="/courses">
            Courses
          </Link>,
          '/courses',
          <BookOutlined />,
          courses === undefined || courses.length === 0
            ? undefined
            : courses.map((course) =>
                getItem(<Link to={`/course/${course.id}/overview`}>{course.cname}</Link>, `/course/${course.id}`),
              ),
        ),
        [UserPermissionActions.READ_COURSE, UserPermissionActions.ADMIN],
        userInfo?.userRoleActions,
      ),
      conditionalRender(
        getItem(
          <Link onClick={(e) => e.stopPropagation()} to="/projects">
            Project
          </Link>,
          '/projects',
          <ProjectOutlined />,
          projects === undefined || projects.length === 0
            ? undefined
            : projects.map((project) =>
                getItem(<Link to={`/project/${project.id}/overview`}>{project.pname}</Link>, `/project/${project.id}`),
              ),
        ),
        [UserPermissionActions.READ_PROJECT, UserPermissionActions.ADMIN],
        userInfo?.userRoleActions,
      ),
      conditionalRender(
        getItem(
          <Link onClick={(e) => e.stopPropagation()} to="/admin">
            Admin
          </Link>,
          '/admin',
          <SettingOutlined />,
        ),
        [UserPermissionActions.ADMIN],
        userInfo?.userRoleActions,
      ),
    ],
    [projects, courses, userInfo],
  );

  const LoggedOutHeader = (
    <Col>
      <Link to="/login">Log in</Link>
    </Col>
  );

  const LoggedInHeader = (
    <>
      <Col>
        <GlobalSearch />
      </Col>
      <Col>
        <QuestionCircleOutlined />
      </Col>
      <Col>
        <BellOutlined />
      </Col>
      <Col>
        <Dropdown menu={{ items: accountMenuItems }}>
          <div className="avatar-group">
            <Avatar>{userInfo?.userEmail[0]}</Avatar>
          </div>
        </Dropdown>
      </Col>
    </>
  );

  const renderHeader = () => (
    <Row justify="end" align="middle" gutter={16}>
      {!userInfo ? LoggedOutHeader : LoggedInHeader}
    </Row>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth="0" className="main-layout-sider">
        <div style={{ fontSize: '2rem', padding: '1rem', color: 'white' }}>Trofos</div>
        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          items={menuItems}
          openKeys={openKeys}
          onOpenChange={onOpenChanged}
        />
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
