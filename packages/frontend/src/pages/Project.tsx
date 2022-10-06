import React, { useCallback, useMemo } from 'react';
import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';
import { Breadcrumb, Button, Dropdown, DropdownProps, Menu, message, PageHeader, Tabs, Tag, Typography } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import { Project, useGetAllProjectsQuery, useRemoveProjectMutation } from '../api/project';
import { useGetAllCoursesQuery, useRemoveProjectFromCourseMutation } from '../api/course';
import { confirmDeleteProject, confirmDetachProject } from '../components/modals/confirm';
import ProjectAttachModal from '../components/modals/ProjectAttachModal';
import { getErrorMessage } from '../helpers/error';
import './Project.css';

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

  const { data: projects } = useGetAllProjectsQuery();
  const { data: courses } = useGetAllCoursesQuery();

  const [removeProject] = useRemoveProjectMutation();
  const [removeProjectFromCourse] = useRemoveProjectFromCourseMutation();

  const project = useMemo(() => {
    if (!projects || projects.length === 0 || !params.projectId) {
      return undefined;
    }
    return projects.filter((p) => p.id.toString() === params.projectId)[0];
  }, [projects, params.projectId]);

  const course = useMemo(() => {
    if (!project || !project.course_id || !courses) {
      return undefined;
    }
    return courses.filter((c) => c.id === project.course_id)[0];
  }, [project, courses]);

  const handleMenuClick = useCallback(
    async (key: string) => {
      if (key === '1' && project) {
        confirmDeleteProject(async () => {
          await removeProject({ id: project.id }).unwrap();
          navigate('/projects');
        });
      } else if (key === '2' && project && project.course_id && project.course_year !== null && project.course_sem) {
        confirmDetachProject(async () => {
          await removeProjectFromCourse({
            courseId: project.course_id as string,
            courseYear: project.course_year as number,
            courseSem: project.course_sem as number,
            projectId: project.id,
          }).unwrap();
        });
      }
    },
    [project, navigate, removeProject, removeProjectFromCourse],
  );

  // Handle detach of project from course
  const handleDetach = useCallback(
    (p: Project) =>
      confirmDetachProject(async () => {
        try {
          if (!p.course_id || !p.course_year || !p.course_sem) {
            throw new Error('Invalid data!');
          }
          removeProjectFromCourse({
            courseId: p.course_id,
            courseYear: p.course_year,
            courseSem: p.course_sem,
            projectId: p.id,
          }).unwrap();
        } catch (err) {
          message.error(getErrorMessage(err));
        }
      }),
    [removeProjectFromCourse],
  );

  if (!params.projectId || !project) {
    return <Typography.Title>This project does not exist!</Typography.Title>;
  }

  const projectMenu = (
    <Menu
      onClick={(e) => handleMenuClick(e.key)}
      items={[
        {
          key: '1',
          label: 'Delete project',
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
        extra={[
          project.course_id ? (
            <Button key="detach" onClick={() => handleDetach(project)}>
              Detach from course
            </Button>
          ) : (
            <ProjectAttachModal project={project} key="attach" />
          ),
          <DropdownMenu projectMenu={projectMenu} key="more" />,
        ]}
        breadcrumb={breadCrumbs}
        style={{ backgroundColor: '#FFF' }}
        footer={
          <Tabs defaultActiveKey="1">
            <Tabs.TabPane
              tab={
                <Link style={{ textDecoration: 'none' }} to={`/project/${project.id}`}>
                  Overview
                </Link>
              }
              key="1"
            />
            <Tabs.TabPane
              tab={
                <Link style={{ textDecoration: 'none' }} to={`/project/${project.id}/backlog`}>
                  Backlog
                </Link>
              }
              key="2"
            />
            <Tabs.TabPane
              tab={
                <Link style={{ textDecoration: 'none' }} to={`/project/${project.id}/kanban`}>
                  Kanban
                </Link>
              }
              key="3"
            />
          </Tabs>
        }
      />
      <section className="project-section-container">
        <Outlet />
      </section>
    </>
  );
}
