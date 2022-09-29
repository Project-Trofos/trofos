import React, { useCallback } from 'react';
import { Card, Dropdown, Menu, message, Space, Tag } from 'antd';
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
        await removeCourse({ ...course }).unwrap();
      });
    } catch (err) {
      message.error(getErrorMessage(err));
    }
  }, [course, removeCourse]);

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
        description={
          <>
            <Tag color="green">{course.id}</Tag>
            <Tag>{`${course.year} Semester ${course.sem}`}</Tag>
          </>
        }
      />
    </Card>
  );
}
