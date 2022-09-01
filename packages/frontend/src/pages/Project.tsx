import React, { useMemo } from 'react';
import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';
import { Breadcrumb, Button, Dropdown, DropdownProps, Menu, PageHeader, Tabs, Typography } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import { useGetAllProjectsQuery, useRemoveProjectMutation } from '../api';


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
  const [removeProject] = useRemoveProjectMutation();

  const project = useMemo(() => {
    if (!projects || projects.length === 0 || !params.projectId) {
      return undefined;
    }
    return projects.filter(p => p.id.toString() === params.projectId)[0];
  }, [projects, params.projectId]);

  if (!params.projectId || !project) {
    return (
    <Typography.Title>This project does not exist!</Typography.Title>
    );
  }
  
  const projectMenu = (
    <Menu
      onClick={() => removeProject({ id: project.id }).then(() => navigate('/projects'))}
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
      <Breadcrumb.Item><Link to='/projects'>Project</Link></Breadcrumb.Item>
      <Breadcrumb.Item>{project.pname}</Breadcrumb.Item>
    </Breadcrumb>
  );
  return (
    <>
      <PageHeader
        title={project.pname}
        className="site-page-header"
        subTitle={project.description}
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
