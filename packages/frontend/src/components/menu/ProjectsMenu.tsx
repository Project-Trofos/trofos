import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu } from 'antd';

export default function ProjectsMenu(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedTab = useMemo(() => {
    // Current location split [projects, :tabName]
    const split = location.pathname.split('/');
    return split[2];
  }, [location.pathname]);

  return (
    <Menu
      mode="horizontal"
      items={[
        { key: 'current', label: 'Current Projects' },
        { key: 'past', label: 'Past Projects' },
        { key: 'future', label: 'Future Projects' },
      ]}
      selectedKeys={[selectedTab]}
      onClick={(e) => navigate(`/projects/${e.key}`)}
    />
  );
}
