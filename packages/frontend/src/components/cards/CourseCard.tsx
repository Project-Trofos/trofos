import React, { useCallback } from 'react';
import { Card, Dropdown, message, Tag, MenuProps } from 'antd';
import { Link } from 'react-router-dom';
import { EllipsisOutlined, SettingOutlined } from '@ant-design/icons';

import { useArchiveCourseMutation, useUnarchiveCourseMutation, useRemoveCourseMutation } from '../../api/course';
import { confirmDeleteCourse, confirmArchiveCourse, confirmUnarchiveCourse } from '../modals/confirm';
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
  const [archiveCourse] = useArchiveCourseMutation();
  const [unarchiveCourse] = useUnarchiveCourseMutation();

  const handleOnDelete = useCallback(() => {
    try {
      confirmDeleteCourse(async () => {
        await removeCourse({ ...course }).unwrap();
      });
    } catch (err) {
      message.error(getErrorMessage(err));
    }
  }, [course, removeCourse]);

  const handleOnArchive = useCallback(() => {
    try {
      confirmArchiveCourse(async () => {
        await archiveCourse({ id: course.id }).unwrap();
      });
    } catch (err) {
      message.error(getErrorMessage(err));
    }
  }, [archiveCourse, course.id]);

  const handleOnUnarchive = useCallback(() => {
    try {
      confirmUnarchiveCourse(async () => {
        await unarchiveCourse({ id: course.id }).unwrap();
      });
    } catch (err) {
      message.error(getErrorMessage(err));
    }
  }, [unarchiveCourse, course.id]);

  const handleOnClick: MenuProps['onClick'] = (e) => {
    if (e.key === 'delete') {
      handleOnDelete();
    }
    if (e.key === 'archive') {
      handleOnArchive();
    }
    if (e.key === 'unarchive') {
      handleOnUnarchive();
    }
  };

  const items: MenuProps['items'] = [
    {
      label: 'delete',
      key: 'delete',
    },
    course?.is_archive
      ? {
          label: 'unarchive',
          key: 'unarchive',
        }
      : {
          label: 'archive',
          key: 'archive',
        },
  ];

  const menu = {
    onClick: handleOnClick,
    items: items,
  };

  return (
    <Card
      className="course-card"
      actions={[
        <Link to={`/course/${course.id}/settings`}>
          <SettingOutlined key="setting" />
        </Link>,
        <Dropdown menu={menu} trigger={['click']}>
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
