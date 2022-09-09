import React, { useCallback, useMemo } from 'react';
import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';
import { Breadcrumb, Button, Dropdown, DropdownProps, Menu, PageHeader, Tabs, Typography } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import { useGetAllProjectsQuery, useRemoveProjectMutation } from '../api/project';
import { useGetAllCoursesQuery } from '../api/course';


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

  const project = useMemo(() => {
    if (!projects || projects.length === 0 || !params.projectId) {
      return undefined;
    }
    return projects.filter(p => p.id.toString() === params.projectId)[0];
  }, [projects, params.projectId]);

  const handleMenuClick = useCallback((key: string) => {
    if (key === '1' && project) {
      removeProject({ id: project.id }).then(() => navigate('/projects'));
    } else if (key === '2') {
      // TODO: add/detach from course modal
      console.log(courses);
    }
  }, [project, courses, navigate, removeProject]);

  if (!params.projectId || !project) {
    return (
    <Typography.Title>This project does not exist!</Typography.Title>
    );
  }

  console.log(project);
  
  const projectMenu = (
    <Menu
      onClick={(e) => handleMenuClick(e.key)}
      items={[
        {
          key: '1',
          label: 'Delete project',
        },
        {
          key: '2',
          label: project.course_id ? 'Detach from course' : 'Attach to course',
        },
      ]}
    />
  );

  const breadCrumbs = (
    <Breadcrumb>
      <Breadcrumb.Item><Link to='/projects'>Project</Link></Breadcrumb.Item>
      <Breadcrumb.Item>{project.pname}</Breadcrumb.Item>
    </Breadcrumb>
  );
  return (
    <>
      <PageHeader
        title={project.pname}
        className="site-page-header"
        subTitle={(courses?.filter((c) => c.id === project.course_id)[0])?.cname}
        extra={[<DropdownMenu projectMenu={projectMenu} key="more" />]}
        breadcrumb={breadCrumbs}
        style={{ backgroundColor: '#FFF' }}
        footer={
          <Tabs defaultActiveKey="1">
            <Tabs.TabPane tab={<Link style={{ textDecoration: 'none' }} to={`/project/${project.id}`}>Overview</Link>} key="1" />
            <Tabs.TabPane tab={<Link style={{ textDecoration: 'none' }} to={`/project/${project.id}/backlog`}>Backlog</Link>} key="2" />
            <Tabs.TabPane tab={<Link style={{ textDecoration: 'none' }} to={`/project/${project.id}/kanban`}>Kanban</Link>} key="3" />
          </Tabs>
        }
      />
      <section>
        <Outlet />
      </section>
    </>
  );
}
