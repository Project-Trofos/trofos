import React, { useCallback } from 'react';
import { Card, Dropdown, Menu, message } from 'antd';
import { Link } from 'react-router-dom';
import { EllipsisOutlined, SettingOutlined } from '@ant-design/icons';

import { Course, useRemoveCourseMutation } from '../../api/course';
import { confirmDeleteCourse } from '../modals/confirm';
import { getErrorMessage } from '../../helpers/error';


const { Meta } = Card;

type CourseCardProps = {
  course: Course;
};

export default function CourseCard(props: CourseCardProps): JSX.Element {
  const { course } = props;
  const [removeCourse] = useRemoveCourseMutation();

  const handleOnClick = useCallback(() => {
    try {
      confirmDeleteCourse(async () => {
        await removeCourse({ id: course.id }).unwrap();
      });
    } catch (err) {
      message.error(getErrorMessage(err));
    }
  }, [course.id, removeCourse]);

  const menu = (
    <Menu
      onClick={handleOnClick}
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
