import { Link, Outlet } from 'react-router-dom';
import { Breadcrumb, Button, Dropdown, DropdownProps, Space, Typography } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import ProjectCreationModal from '../../components/modals/ProjectCreationModal';
import ImportDataModal from '../../components/modals/ImportDataModal';
import Container from '../../components/layouts/Container';
import PageHeader from '../../components/pageheader/PageHeader';
import { exampleCourse } from './example';

function DropdownMenu({ courseMenu }: { courseMenu: DropdownProps['menu'] }) {
  return (
    <Dropdown key="more" menu={courseMenu} placement="bottomRight">
      <Button type="text" icon={<MoreOutlined style={{ fontSize: 20 }} />} />
    </Dropdown>
  );
}

export default function CourseExample(): JSX.Element {
  const course = exampleCourse;

  if (!course) {
    return (
      <Space>
        <Typography.Title>This course does not exist!</Typography.Title>
      </Space>
    );
  }

  const courseMenu: DropdownProps['menu'] = {
    onClick: (e) => {},
    items: [
      {
        key: '1',
        label: 'Delete course',
      },
    ],
  };

  const breadCrumbs = (
    <Breadcrumb>
      <Breadcrumb.Item>
        <Link to="">Courses</Link>
      </Breadcrumb.Item>
      <Breadcrumb.Item>
        <Link to="">{course.cname}</Link>
      </Breadcrumb.Item>
    </Breadcrumb>
  );

  return (
    <Container fullWidth noGap>
      <PageHeader
        title={course.cname}
        subTitle={course.description === null ? '' : course.description}
        breadCrumbs={breadCrumbs}
        tagText={course.code}
        buttons={[
          <ImportDataModal key="import-csv" course={course} projects={[]} disableClickEvent={true} />,
          <ProjectCreationModal key="create-project" course={course} disableClickEvent={true} />,
          <DropdownMenu key="more" courseMenu={courseMenu} />,
        ]}
      />
      <Outlet />
    </Container>
  );
}
