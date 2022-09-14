import React from 'react';
import { Card, Dropdown, Menu, message } from 'antd';
import { Link } from 'react-router-dom';
import { EllipsisOutlined, SettingOutlined } from '@ant-design/icons';

import { Course, useRemoveCourseMutation } from '../../api/course';
import { confirmDeleteCourse } from '../modals/confirm';


const { Meta } = Card;

type CourseCardProps = {
  course: Course;
};

export default function CourseCard(props: CourseCardProps): JSX.Element {
  const { course } = props;
  const [removeCourse] = useRemoveCourseMutation();

  const menu = (
    <Menu
      onClick={() => confirmDeleteCourse(() => removeCourse({ id: course.id }).catch(message.error))}
      items={[
        {
          label: 'delete',
          key: '0',
        },
      ]}
    />
  );

  return (
    <Card
      style={{ width: 300 }}
      actions={[
        <SettingOutlined key="setting" />,
        <Dropdown overlay={menu} trigger={['click']}>
          <EllipsisOutlined key="more" />
        </Dropdown>,
      ]}
    >
      <Meta
        title={<Link to={`/course/${course.id}`}>{course.cname}</Link>}
        description={course.id ?? 'No id'}
      />
    </Card>
  );
}
