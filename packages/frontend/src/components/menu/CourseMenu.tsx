import React, { useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Menu, Spin } from 'antd';
import { useCourse } from '../../api/hooks';
import { useIsCourseManager } from '../../api/hooks/roleHooks';

export default function CourseMenu(): JSX.Element {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const selectedTab = useMemo(() => {
    // Current location split [course, :courseId, :tabName]
    const split = location.pathname.split('/');
    return split[3];
  }, [location.pathname]);

  const { course, isLoading } = useCourse(params.courseId);
  const { isCourseManager } = useIsCourseManager();

  if (isLoading || !params.courseId || !course) {
    return <Spin />;
  }

  return (
    <Menu
      mode="horizontal"
      items={[
        { key: 'overview', label: 'Overview' },
        { key: 'users', label: 'Users' },
        ...(isCourseManager
          ? [
              { key: 'milestones', label: 'Milestones' },
              { key: 'statistics', label: 'Statistics' },
              { key: 'settings', label: 'Settings' },
            ]
          : []),
      ]}
      selectedKeys={[selectedTab]}
      onClick={(e) => navigate(`/course/${course.id}/${e.key}`)}
    />
  );
}
