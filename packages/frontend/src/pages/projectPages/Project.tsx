import React, { useCallback } from 'react';
import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';
import { Breadcrumb, Button, Dropdown, DropdownProps, message, Spin, Typography } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import { useRemoveProjectMutation } from '../../api/project';
import { useRemoveProjectFromCourseMutation } from '../../api/course';
import { confirmDeleteProject, confirmDetachProject } from '../../components/modals/confirm';
import ProjectAttachModal from '../../components/modals/ProjectAttachModal';
import { getErrorMessage } from '../../helpers/error';
import { useProject } from '../../api/hooks';
import './Project.css';
import PageHeader from '../../components/pageheader/PageHeader';
import useSocket from '../../api/socket/useSocket';
import trofosApiSlice from '../../api';
import store from '../../app/store';
import { UpdateType } from '../../api/socket/socket';

const { Text } = Typography;

function DropdownMenu({ projectMenu }: { projectMenu: DropdownProps['menu'] }) {
  return (
    <Dropdown key="more" menu={projectMenu} placement="bottomRight">
      <Button size="small" type="text" icon={<MoreOutlined style={{ fontSize: 20 }} />} />
    </Dropdown>
  );
}

export default function ProjectPage(): JSX.Element {
  const params = useParams();

  const navigate = useNavigate();

  const [removeProject] = useRemoveProjectMutation();
  const [removeProjectFromCourse] = useRemoveProjectFromCourseMutation();

  const projectId = Number(params.projectId) || -1;

  const { project, course, isLoading } = useProject(projectId);

  // Refetch active sprint data upon update
  const handleReset = useCallback(() => {
    store.dispatch(trofosApiSlice.util.invalidateTags(['Backlog', 'BacklogHistory', 'Sprint']));
  }, []);
  useSocket(UpdateType.BACKLOG, projectId.toString(), handleReset);

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
    return <Spin />;
  }

  if (!params.projectId || !project) {
    return <Typography.Title>This project does not exist!</Typography.Title>;
  }

  const projectMenu: DropdownProps['menu'] = {
    onClick: (e) => handleMenuClick(e.key),
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
        {course ? (
          <>
            <Link to={`/course/${project.course_id}/overview`}>{project.course.cname}</Link>
          </>
        ) : (
          <span>Independent Project</span>
        )}
      </Breadcrumb.Item>
      <Breadcrumb.Item>
        <Link to={`/project/${project.id}/overview`}>{project.pname}</Link>
      </Breadcrumb.Item>
    </Breadcrumb>
  );

  return (
    <>
      <PageHeader extra={[<DropdownMenu projectMenu={projectMenu} key="more" />]} breadcrumb={breadCrumbs}>
        {project.description && <Text>{project.description}</Text>}
      </PageHeader>
      <section className="overflow-scroll-container">
        <Outlet />
      </section>
    </>
  );
}
