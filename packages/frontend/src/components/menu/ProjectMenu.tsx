import React, { useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Menu, Spin, ConfigProvider } from 'antd';
import { useProject } from '../../api/hooks';

export default function ProjectMenu(): JSX.Element {
  const params = useParams();

  const navigate = useNavigate();
  const location = useLocation();

  const projectId = Number(params.projectId) || -1;

  const { project, isLoading } = useProject(projectId);

  const selectedTab = useMemo(() => {
    // Current location split [project, :projectId, :tabName]
    const split = location.pathname.split('/');
    return split[3];
  }, [location.pathname]);

  if (isLoading || !params.projectId || !project) {
    return <Spin />;
  }

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
          { key: 'sprint', label: 'Sprint' },
          { key: 'board', label: 'Board' },
          { key: 'standup', label: 'Stand Up' },
          { key: 'statistics', label: 'Statistics' },
          { key: 'feedback', label: 'Feedback' },
          { key: 'settings', label: 'Settings' },
        ]}
        selectedKeys={[selectedTab]}
        onClick={(e) => navigate(`/project/${project.id}/${e.key}`)}
      />
    </ConfigProvider>
  );
}
