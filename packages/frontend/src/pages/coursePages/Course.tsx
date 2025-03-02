import React, { useCallback, useMemo } from 'react';
import { Link, useNavigate, useParams, useLocation, Outlet } from 'react-router-dom';
import { Breadcrumb, Button, Dropdown, DropdownProps, Space, Typography } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import { useRemoveCourseMutation } from '../../api/course';
import { confirmDeleteCourse } from '../../components/modals/confirm';
import ProjectCreationModal from '../../components/modals/ProjectCreationModal';
import { useCourse } from '../../api/hooks';
import ImportDataModal from '../../components/modals/ImportDataModal';
import { useIsCourseManager } from '../../api/hooks/roleHooks';
import Container from '../../components/layouts/Container';
import PageHeader from '../../components/pageheader/PageHeader';
import LoadingComponent from '../../components/common/LoadingComponent';

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

  const { course, filteredProjects, isLoading } = useCourse(params.courseId);
  const { isCourseManager } = useIsCourseManager();

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

  if (isLoading) {
    return <LoadingComponent />;
  }

  if (!params.courseId || !course) {
    return (
      <Space>
        <Typography.Title>This course does not exist!</Typography.Title>
      </Space>
    );
  }

  const courseMenu: DropdownProps['menu'] = {
    onClick: (e) => handleMenuClick(e.key),
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
      <Breadcrumb.Item>
        <Link to={`/course/${course.id}/overview`}>{course.cname}</Link>
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
        buttons={isCourseManager
          ? [
              <ImportDataModal key="import-csv" course={course} projects={filteredProjects} />,
              <ProjectCreationModal key="create-project" course={course} />,
              <DropdownMenu key="more" courseMenu={courseMenu} />,
            ]
          : undefined
        }
      />
      <Outlet />
    </Container>
  );
}
