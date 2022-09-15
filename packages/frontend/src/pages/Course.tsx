import React, { useCallback, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Breadcrumb, Button, Dropdown, DropdownProps, Menu, message, PageHeader, Space, Tabs, Typography } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import { useGetAllCoursesQuery, useRemoveCourseMutation } from '../api/course';
import ProjectTable from '../components/tables/ProjectTable';
import { confirmDeleteCourse } from '../components/modals/confirm';
import ProjectCreationModal from '../components/modals/ProjectCreationModal';
import { useGetAllProjectsQuery } from '../api/project';
import { getErrorMessage } from '../helpers/error';


function DropdownMenu({ courseMenu }: { courseMenu: DropdownProps['overlay'] }) {
  return (
    <Dropdown key="more" overlay={courseMenu} placement="bottomRight">
      <Button type="text" icon={<MoreOutlined style={{ fontSize: 20 }} />} />
    </Dropdown>
  );
}

export default function CoursePage(): JSX.Element {
  const params = useParams();
  const navigate = useNavigate();

  const { data: courses } = useGetAllCoursesQuery();
  const { data: projects, isLoading } = useGetAllProjectsQuery();
  const [removeCourse] = useRemoveCourseMutation();

  const course = useMemo(() => {
    if (!courses || courses.length === 0 || !params.courseId) {
      return undefined;
    }
    return courses.filter(p => p.id.toString() === params.courseId)[0];
  }, [courses, params.courseId]);

  const filteredProjects = useMemo(() => {
    if (!course || !projects) {
      return [];
    }
    return projects.filter(p => p.course_id === course.id);
  }, [course, projects]);

  const handleMenuClick = useCallback((key: string) => {
    try {
      if (key === '1' && course) {
        confirmDeleteCourse(async () => {
          removeCourse({ id: course.id }).unwrap();
          navigate('/courses');
        });
      }
    } catch (err) {
      message.error(getErrorMessage(err));
    }
  }, [course, navigate, removeCourse]);

  if (!params.courseId || !course) {
    return (
      <Space>
        <Typography.Title>This course does not exist!</Typography.Title>
      </Space>
    );
  }
  
  const courseMenu = (
    <Menu
      onClick={(e) => handleMenuClick(e.key)}
      items={[
        {
          key: '1',
          label: 'Delete course',
        },
      ]}
    />
  );

  const breadCrumbs = (
    <Breadcrumb>
      <Breadcrumb.Item><Link to='/courses'>Courses</Link></Breadcrumb.Item>
      <Breadcrumb.Item>{course.cname}</Breadcrumb.Item>
    </Breadcrumb>
  );

  return (
    <>
      <PageHeader
        title={course.cname}
        subTitle={course.id}
        extra={[
          <ProjectCreationModal key="create-project" courseId={course.id} />,
          <DropdownMenu key="more" courseMenu={courseMenu} />,
        ]}
        breadcrumb={breadCrumbs}
        style={{ backgroundColor: '#FFF' }}
        footer={
          <Tabs defaultActiveKey="1" />
        }
      />
      {/* TODO: make this responsive */}
      <section style={{ margin: '2em' }}>
        <ProjectTable projects={filteredProjects} isLoading={isLoading} />
      </section>
    </>
  );
}
