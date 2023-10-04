import React, { useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Spin, Tabs } from 'antd';
import { useProject } from '../../api/hooks';

export default function ProjectTabs(): JSX.Element {
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
    <Tabs
      items={[
        { key: 'overview', label: 'Overview' },
        { key: 'users', label: 'Users' },
        { key: 'sprint', label: 'Sprint' },
        { key: 'board', label: 'Board' },
        { key: 'feedback', label: 'Feedback' },
        { key: 'statistics', label: 'Statistics' },
        { key: 'settings', label: 'Settings' },
      ]}
      activeKey={selectedTab}
      className="footer-tabs"
      onChange={(key) => navigate(`/project/${project.id}/${key}`)}
    />
  );
}
