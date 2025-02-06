import React, { useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Menu, Spin, ConfigProvider } from 'antd';
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

  if (isLoading) {
    return <Spin />;
  }
  const courseId = Number(course?.id) || -1;

  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            darkItemBg: 'rgb(10,10,10)',
            itemBg: '',
          },
        },
      }}
    >
      <Menu
        style={{ border: 'none' }}
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
        onClick={(e) => navigate(`/course/${courseId}/${e.key}`)}
      />
    </ConfigProvider>
  );
}
