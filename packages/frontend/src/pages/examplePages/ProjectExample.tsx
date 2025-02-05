import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';
import { Breadcrumb, Button, Dropdown, DropdownProps, message, Spin, Tooltip, Typography } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import Container from '../../components/layouts/Container';
import PageHeader from '../../components/pageheader/PageHeader';
import { exampleProject } from './example';

function DropdownMenu({ projectMenu }: { projectMenu: DropdownProps['menu'] }) {
  return (
    <Dropdown key="more" menu={projectMenu} placement="bottomRight">
      <Button size="small" type="text" icon={<MoreOutlined style={{ fontSize: 20 }} />} />
    </Dropdown>
  );
}

export default function ProjectExample(): JSX.Element {
  const project = exampleProject;
  const projectMenu: DropdownProps['menu'] = {
    items: [
      {
        key: 'delete',
        label: 'Delete project',
        danger: true,
      },
    ],
  };

  const breadCrumbs = (
    <Breadcrumb>
      <Breadcrumb.Item>
        {project.course ? (
          <>
            <Link to={''}>{project.course.cname}</Link>
          </>
        ) : (
          <span>Independent Project</span>
        )}
      </Breadcrumb.Item>
      <Breadcrumb.Item>
        <Link to={''}>{project.pname}</Link>
      </Breadcrumb.Item>
    </Breadcrumb>
  );

  return (
    <Container fullWidth noGap>
      <PageHeader
        buttons={[<DropdownMenu projectMenu={projectMenu} key="more" />]}
        breadCrumbs={breadCrumbs}
        title={project.pname}
        subTitle={project.description ? project.description : undefined}
        tagText={project.pkey ? project.pkey : undefined}
      />
      <Outlet />
    </Container>
  );
}
