import React, { useEffect, useMemo, useState } from 'react';
import { Col, Layout, Row, MenuProps, Dropdown, Menu, Typography, Space, Image, FloatButton, Button } from 'antd';
import {
  BookOutlined,
  HomeOutlined,
  KeyOutlined,
  ProjectOutlined,
  SettingOutlined,
  UnorderedListOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { useCurrentAndPastCourses, useCurrentAndPastProjects } from '../api/hooks';
import { useLogoutUserMutation, useGetUserInfoQuery, UserInfo } from '../api/auth';
import trofosApiSlice from '../api/index';
import GlobalSearch from '../components/search/GlobalSearch';
import { UserPermissionActions } from '../helpers/constants';
import conditionalRender from '../helpers/conditionalRender';
import AvatarButton from '../components/button/AvatarButton';
import MenuSwitch from '../components/menu/MenuSwitch';

import './MainLayout.css';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { toggleTheme } from '../app/localSettingsSlice';
import ThemeSwitch from '../components/theming/ThemeSwitch';
import AiChatBase from '../components/aichat/AiChatBase';
import TourComponent from '../components/tour/Tour';
import { StepTarget, STEP_PROP } from '../components/tour/TourSteps';
import { useGetFeatureFlagsQuery } from '../api/featureFlag';
import AiChatButton from '../components/aichat/AiChatButton';

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

// Temporary until we implement a proper user auth/info flow
function LogoutText() {
  const [logoutUser] = useLogoutUserMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
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
}

function LoggedInHeader({ userInfo }: { userInfo: UserInfo | undefined }) {
  const navigate = useNavigate();

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
      label: <LogoutText />,
    },
  ];

  return (
    <Space size={'middle'}>
      <Col>
        <ThemeSwitch />
      </Col>
      <Col>
        <GlobalSearch />
      </Col>
      <Col>
        <Button type="text" href="https://project-trofos.github.io/trofos/" target="_blank">
          <QuestionCircleOutlined />
        </Button>
      </Col>
      {/* TODO: To be implemented */}
      {/* 
        <Col>
          <BellOutlined />
        </Col> */}
      <Dropdown trigger={['click']} menu={{ items: accountMenuItems }}>
        <div className="avatar-group">
          <AvatarButton userInfo={userInfo} />
        </div>
      </Dropdown>
    </Space>
  );
}

/**
 * Main layout of the application.
 */
export default function MainLayout() {
  const [isBroken, setIsBroken] = useState(false);
  const [aiChatIsOpen, setAiChatIsOpen] = useState(false);

  const { currentProjects: projects } = useCurrentAndPastProjects();
  const { currentCourses: courses } = useCurrentAndPastCourses();
  const { data: userInfo, isLoading } = useGetUserInfoQuery();
  const { data: featureFlags, isLoading: isFeatureFlagsLoading } = useGetFeatureFlagsQuery();

  const isDarkTheme = useAppSelector((state) => state.localSettingsSlice.isDarkTheme);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !userInfo && location.pathname !== '/') {
      navigate('/');
    }
  }, [userInfo, location, navigate, isLoading]);

  const selectedKeys = useMemo(() => {
    // Handle viewing all courses
    if (location.pathname.split('/', 2)[1] === 'courses') {
      return ['/courses'];
    }
    // Handle viewing all projects
    if (location.pathname.split('/', 2)[1] === 'projects') {
      return ['/projects'];
    }
    // Check if a course is selected
    if (location.pathname.split('/', 2)[1] === 'course') {
      return [location.pathname.split('/', 5).slice(0, 3).join('/')];
    }
    // Handle manage api key tab selected
    if (location.pathname.split('/', 2)[1] === 'manage-api-key') {
      return ['/api-key'];
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

  const menuItems: MenuItem[] = useMemo(
    () => [
      getItem(<Link to="/">Home</Link>, '/', <HomeOutlined />),
      conditionalRender(
        getItem(
          <Link {...{ [STEP_PROP]: StepTarget.COURSES_TAB }} onClick={(e) => e.stopPropagation()} to="/courses">
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
          <Link {...{ [STEP_PROP]: StepTarget.PROJECTS_TAB }} onClick={(e) => e.stopPropagation()} to="/projects">
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
          <Link {...{ [STEP_PROP]: StepTarget.ADMIN_TAB }} onClick={(e) => e.stopPropagation()} to="/admin">
            Admin
          </Link>,
          '/admin',
          <SettingOutlined />,
        ),
        [UserPermissionActions.ADMIN],
        userInfo?.userRoleActions,
      ),
      conditionalRender(
        getItem(
          <Link {...{ [STEP_PROP]: StepTarget.API_KEY_TAB }} onClick={(e) => e.stopPropagation()} to="/manage-api-key">
            API Keys
          </Link>,
          '/api-key',
          <KeyOutlined />,
        ),
        [UserPermissionActions.READ_API_KEY, UserPermissionActions.ADMIN],
        userInfo?.userRoleActions,
      ),
    ],
    [projects, courses, userInfo],
  );

  const onOpenAiChat = () => {
    setAiChatIsOpen(true);
  };

  const onCloseAiChat = () => {
    setAiChatIsOpen(false);
  };

  // User is not logged in
  if (!userInfo) {
    return <Outlet />;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        onBreakpoint={setIsBroken}
        className="main-layout-sider"
        trigger={<UnorderedListOutlined style={{ color: isDarkTheme ? '#FFF' : '#000' }} />}
        zeroWidthTriggerStyle={{
          position: 'absolute',
          margin: '8px',
          zIndex: 1000,
        }}
      >
        <Link to="/" className="logo">
          <Image width={40} src="favicon.ico" preview={false} />
          <div>Trofos</div>
        </Link>
        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          items={menuItems}
          openKeys={openKeys}
          onOpenChange={onOpenChanged}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 10px', overflowX: 'auto' }}>
          <Row justify={'space-between'}>
            <Col style={{ paddingLeft: isBroken ? '30px' : 0 }} span={10}>
              <MenuSwitch />
            </Col>
            <Col>
              <LoggedInHeader userInfo={userInfo} />
            </Col>
          </Row>
        </Header>
        <Content style={{ minHeight: 360, display: 'flex', flexDirection: 'column' }}>
          <Outlet />
        </Content>
      </Layout>
      {featureFlags?.some((flag) => flag.feature_name === 'onboarding_tour' && flag.active) && <TourComponent />}
      {featureFlags?.some((flag) => flag.feature_name === 'user_guide_copilot' && flag.active) && (
        <AiChatButton onClick={onOpenAiChat} />
      )}
      <AiChatBase open={aiChatIsOpen} onClose={onCloseAiChat} />
    </Layout>
  );
}
