import React, { useCallback } from 'react';
import { Card, Dropdown, Menu, message, Tag } from 'antd';
import { Link } from 'react-router-dom';
import { EllipsisOutlined, SettingOutlined } from '@ant-design/icons';

import { useRemoveCourseMutation } from '../../api/course';
import { confirmDeleteCourse } from '../modals/confirm';
import { getErrorMessage } from '../../helpers/error';
import { Course } from '../../api/types';

import './CourseCard.css';

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
      className="course-card"
      actions={[
        <Link to={`/course/${course.id}/settings`}>
          <SettingOutlined key="setting" />
        </Link>,
        <Dropdown overlay={menu} trigger={['click']}>
          <EllipsisOutlined key="more" />
        </Dropdown>,
      ]}
    >
      <Meta
        title={<Link to={`/course/${course.id}/overview`}>{course.cname}</Link>}
        description={
          <>
            <Tag color="green">{course.code}</Tag>
            <Tag>{`${course.startYear} Semester ${course.startSem}`}</Tag>
          </>
        }
      />
    </Card>
  );
}
