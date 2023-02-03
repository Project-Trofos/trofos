import React, { useCallback, useMemo } from 'react';
import { Link, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Breadcrumb, Button, Dropdown, DropdownProps, message, Spin, Tabs, Tag, Typography } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import { useRemoveProjectMutation } from '../api/project';
import { useRemoveProjectFromCourseMutation } from '../api/course';
import { confirmDeleteProject, confirmDetachProject } from '../components/modals/confirm';
import ProjectAttachModal from '../components/modals/ProjectAttachModal';
import { getErrorMessage } from '../helpers/error';
import { useProject } from '../api/hooks';
import './Project.css';
import PageHeader from '../components/pageheader/PageHeader';
import useSocket from '../api/socket/useSocket';
import trofosApiSlice from '../api';
import store from '../app/store';
import { UpdateType } from '../api/socket/socket';

const { Text } = Typography;

function DropdownMenu({ projectMenu }: { projectMenu: DropdownProps['menu'] }) {
  return (
    <Dropdown key="more" menu={projectMenu} placement="bottomRight">
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

  const projectId = Number(params.projectId) || -1;

  const { project, course, isLoading } = useProject(projectId);

  // Refetch active sprint data upon update
  const handleReset = useCallback(() => {
    store.dispatch(trofosApiSlice.util.invalidateTags(['Backlog', 'BacklogHistory', 'Sprint']));
  }, []);
  useSocket(UpdateType.BACKLOG, projectId.toString(), handleReset);

  const selectedTab = useMemo(() => {
    // Current location split [project, :projectId, :tabName]
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
        } else if (key === 'detach' && project && project.course_id !== null) {
          confirmDetachProject(async () => {
            if (!project.course_id) {
              throw new Error('Invalid data!');
            }
            removeProjectFromCourse({
              courseId: project.course_id,
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

  const projectMenu = {
    onClick: (e: any) => handleMenuClick(e.key),
    items: [
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
    ],
  };

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
              <Tag>{course?.code}</Tag>
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
          <Tabs
            items={[
              { key: 'overview', label: 'Overview' },
              { key: 'users', label: 'Users' },
              { key: 'sprint', label: 'Sprint' },
              { key: 'board', label: 'Board' },
              { key: 'settings', label: 'Settings' },
            ]}
            activeKey={selectedTab}
            className="footer-tabs"
            onChange={(key) => navigate(`/project/${project.id}/${key}`)}
          />
        }
      >
        <Text>{project.description}</Text>
      </PageHeader>
      <section className="project-section-container">
        <Outlet />
      </section>
    </>
  );
}
