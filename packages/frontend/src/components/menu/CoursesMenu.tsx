import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu } from 'antd';

export default function CoursesMenu(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedTab = useMemo(() => {
    // Current location split [courses, :tabName]
    const split = location.pathname.split('/');
    return split[2];
  }, [location.pathname]);

  return (
    <Menu
      style={{ border: 'none' }}
      mode="horizontal"
      items={[
        { key: 'current', label: 'Current Courses' },
        { key: 'past', label: 'Past Courses' },
        { key: 'future', label: 'Future Courses' },
      ]}
      selectedKeys={[selectedTab]}
      onClick={(e) => navigate(`/courses/${e.key}`)}
    />
  );
}
