import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { List, Typography } from 'antd';
import { useGetBacklogsQuery } from '../api/backlog';
import { useGetProjectQuery } from '../api/project';
import type { Backlog } from '../api/backlog';
import BacklogCreationModal from '../components/modals/BacklogCreationModal';
import BacklogListingCard from '../components/cards/BacklogListingCard';
import './ProjectBacklogs.css';

function ProjectBacklog(): JSX.Element {
  const params = useParams();
  const navigate = useNavigate();
  const { Title } = Typography;

  const projectId = Number(params.projectId);
  const { data: backlogs } = useGetBacklogsQuery(projectId);
  const { data: projectData } = useGetProjectQuery({ id: projectId });

  const handleBacklogOnClick = (backlogId: number) => {
    navigate(`/project/${params.projectId}/backlog/${backlogId}`);
  };

  const renderBacklogListingCards = (backlog: Backlog) => (
    <List.Item className="backlog-card-container" onClick={() => handleBacklogOnClick(backlog.backlog_id)}>
      <BacklogListingCard backlog={backlog} projectKey={projectData?.pkey} />
    </List.Item>
  );

  return (
    <div className="project-backlog-container">
      <div className="project-backlog-title-container">
        <Title className="project-backlog-title" level={2}>
          Backlogs
        </Title>
        <BacklogCreationModal />
      </div>
      <List dataSource={backlogs} renderItem={renderBacklogListingCards} />
    </div>
  );
}

export default ProjectBacklog;
