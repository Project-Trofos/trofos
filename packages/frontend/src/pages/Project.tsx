import React, { useCallback, useMemo } from 'react';
import { Link, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Breadcrumb,
  Button,
  Dropdown,
  DropdownProps,
  Menu,
  message,
  PageHeader,
  Spin,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import { useRemoveProjectMutation } from '../api/project';
import { useRemoveProjectFromCourseMutation } from '../api/course';
import { confirmDeleteProject, confirmDetachProject } from '../components/modals/confirm';
import ProjectAttachModal from '../components/modals/ProjectAttachModal';
import { getErrorMessage } from '../helpers/error';
import { useProject } from '../api/hooks';

const { Paragraph } = Typography;

function DropdownMenu({ projectMenu }: { projectMenu: DropdownProps['overlay'] }) {
  return (
    <Dropdown key="more" overlay={projectMenu} placement="bottomRight">
      <Button type="text" icon={<MoreOutlined style={{ fontSize: 20 }} />} />
    </Dropdown>
  );
}

export default function ProjectPage(): JSX.Element {
  const params = useParams();

  const navigate = useNavigate();
  const location = useLocation();

  const [removeProject] = useRemoveProjectMutation();
  const [removeProjectFromCourse] = useRemoveProjectFromCourseMutation();

  const { project, course, isLoading } = useProject(params.projectId);

  const selectedTab = useMemo(() => {
    const split = location.pathname.split('/');
    return split[3];
  }, [location.pathname]);

  const handleMenuClick = useCallback(
    async (key: string) => {
      try {
        if (key === 'delete' && project) {
          confirmDeleteProject(async () => {
            await removeProject({ id: project.id }).unwrap();
            navigate('/projects');
          });
        } else if (
          key === 'detach' &&
          project &&
          project.course_id !== null &&
          project.course_year !== null &&
          project.course_sem !== null
        ) {
          confirmDetachProject(async () => {
            if (!project.course_id || !project.course_year || !project.course_sem) {
              throw new Error('Invalid data!');
            }
            removeProjectFromCourse({
              courseId: project.course_id,
              courseYear: project.course_year,
              courseSem: project.course_sem,
              projectId: project.id,
            }).unwrap();
          });
        }
      } catch (err) {
        message.error(getErrorMessage(err));
      }
    },
    [project, navigate, removeProject, removeProjectFromCourse],
  );

  if (isLoading) {
    return <Spin size="large" />;
  }

  if (!params.projectId || !project) {
    return <Typography.Title>This project does not exist!</Typography.Title>;
  }

  const projectMenu = (
    <Menu
      onClick={(e) => handleMenuClick(e.key)}
      items={[
        {
          key: 'delete',
          label: 'Delete project',
          danger: true,
        },
        course
          ? {
              key: 'detach',
              label: 'Detach from course',
            }
          : {
              key: 'attach',
              label: <ProjectAttachModal project={project} key="attach" />,
            },
      ]}
    />
  );

  const breadCrumbs = (
    <Breadcrumb>
      <Breadcrumb.Item>
        <Link to="/projects">Project</Link>
      </Breadcrumb.Item>
      <Breadcrumb.Item>{project.pname}</Breadcrumb.Item>
    </Breadcrumb>
  );

  return (
    <>
      <PageHeader
        title={project.pname}
        subTitle={
          course ? (
            <>
              <Tag>{course?.id}</Tag>
              <span>{course?.cname}</span>
            </>
          ) : (
            <Tag>Independent Project</Tag>
          )
        }
        extra={[<DropdownMenu projectMenu={projectMenu} key="more" />]}
        breadcrumb={breadCrumbs}
        style={{ backgroundColor: '#FFF' }}
        footer={
          <Tabs defaultActiveKey="overview" activeKey={selectedTab}>
            <Tabs.TabPane
              tab={
                <Link style={{ textDecoration: 'none' }} to={`/project/${project.id}/overview`}>
                  Overview
                </Link>
              }
              key="overview"
            />
            <Tabs.TabPane
              tab={
                <Link style={{ textDecoration: 'none' }} to={`/project/${project.id}/backlog`}>
                  Backlog
                </Link>
              }
              key="backlog"
            />
            <Tabs.TabPane
              tab={
                <Link style={{ textDecoration: 'none' }} to={`/project/${project.id}/kanban`}>
                  Kanban
                </Link>
              }
              key="kanban"
            />
            <Tabs.TabPane
              tab={
                <Link style={{ textDecoration: 'none' }} to={`/project/${project.id}/settings`}>
                  Settings
                </Link>
              }
              key="settings"
            />
          </Tabs>
        }
      >
        <Paragraph>{project.description}</Paragraph>
      </PageHeader>
      <section>
        <Outlet />
      </section>
    </>
  );
}
