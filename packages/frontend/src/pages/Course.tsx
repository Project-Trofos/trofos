import React, { useCallback, useMemo } from 'react';
import { Link, useNavigate, useParams, useLocation, Outlet } from 'react-router-dom';
import { Breadcrumb, Button, Dropdown, DropdownProps, Space, Tabs, Tag, Typography } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import { useRemoveCourseMutation } from '../api/course';
import { confirmDeleteCourse } from '../components/modals/confirm';
import ProjectCreationModal from '../components/modals/ProjectCreationModal';
import { useCourse } from '../api/hooks';
import PageHeader from '../components/pageheader/PageHeader';

const { Text } = Typography;

function DropdownMenu({ courseMenu }: { courseMenu: DropdownProps['menu'] }) {
  return (
    <Dropdown key="more" menu={courseMenu} placement="bottomRight">
      <Button type="text" icon={<MoreOutlined style={{ fontSize: 20 }} />} />
    </Dropdown>
  );
}

export default function CoursePage(): JSX.Element {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [removeCourse] = useRemoveCourseMutation();

  const selectedTab = useMemo(() => {
    // Current location split [course, :courseId, :tabName]
    const split = location.pathname.split('/');
    return split[3];
  }, [location.pathname]);

  const { course } = useCourse(params.courseId);

  const handleMenuClick = useCallback(
    async (key: string) => {
      if (key === '1' && course) {
        confirmDeleteCourse(async () => {
          await removeCourse({ ...course }).unwrap();
          navigate('/courses');
        });
      }
    },
    [course, navigate, removeCourse],
  );

  if (!params.courseId || !course) {
    return (
      <Space>
        <Typography.Title>This course does not exist!</Typography.Title>
      </Space>
    );
  }

  const courseMenu = {
    onClick: (e: any) => handleMenuClick(e.key),
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
        <Link to="/courses">Courses</Link>
      </Breadcrumb.Item>
      <Breadcrumb.Item>{course.cname}</Breadcrumb.Item>
    </Breadcrumb>
  );

  return (
    <>
      <PageHeader
        title={course.cname}
        subTitle={<Tag>{course.code}</Tag>}
        extra={[
          <ProjectCreationModal key="create-project" course={course} />,
          <DropdownMenu key="more" courseMenu={courseMenu} />,
        ]}
        breadcrumb={breadCrumbs}
        style={{ backgroundColor: '#FFF' }}
        footer={
          <Tabs
            items={[
              { key: 'overview', label: 'Overview' },
              { key: 'users', label: 'Users' },
              { key: 'settings', label: 'Settings' },
            ]}
            activeKey={selectedTab}
            className="footer-tabs"
            onChange={(key) => navigate(`/course/${course.id}/${key}`)}
          />
        }
      >
        <Text>{course.description}</Text>
      </PageHeader>
      {/* TODO: make this responsive */}
      <Outlet />
    </>
  );
}
