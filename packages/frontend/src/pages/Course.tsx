import React, { useMemo } from 'react';
import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';
import { Breadcrumb, Button, Dropdown, DropdownProps, Menu, PageHeader, Tabs, Typography } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import { useGetAllCoursesQuery, useRemoveCourseMutation } from '../api/course';


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
  const [removeCourse] = useRemoveCourseMutation();

  const course = useMemo(() => {
    if (!courses || courses.length === 0 || !params.courseId) {
      return undefined;
    }
    return courses.filter(p => p.id.toString() === params.courseId)[0];
  }, [courses, params.courseId]);

  if (!params.courseId || !course) {
    return (
    <Typography.Title>This course does not exist!</Typography.Title>
    );
  }
  
  const courseMenu = (
    <Menu
      onClick={() => removeCourse({ id: course.id }).then(() => navigate('/courses'))}
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
        className="site-page-header"
        subTitle={course.description}
        extra={[<DropdownMenu courseMenu={courseMenu} key="more" />]}
        breadcrumb={breadCrumbs}
        style={{ backgroundColor: '#FFF' }}
        footer={
          <Tabs defaultActiveKey="1" />
        }
      />
      <section>
        <Outlet />
      </section>
    </>
  );
}
