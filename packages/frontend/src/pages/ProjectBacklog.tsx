import React from 'react';
import { useParams } from 'react-router-dom';
import { List, Typography } from 'antd';
import { useGetBacklogsQuery } from '../api/backlog';
import type { Backlog } from '../api/backlog';
import BacklogModal from '../components/modals/BacklogModal';
import BacklogCard from '../components/cards/BacklogCard';
import './ProjectBacklog.css';

function ProjectBacklog(): JSX.Element {
  const params = useParams();
  const { Title } = Typography;

  const projectId = Number(params.projectId);
  const { data: backlogs } = useGetBacklogsQuery(projectId);

  const renderBacklogCards = (backlog: Backlog) => (
    <List.Item className="backlog-card-container">
      <BacklogCard backlog={backlog} />
    </List.Item>
  );

  return (
    <div className="project-backlog-container">
      <div className="project-backlog-title-container">
        <Title className="project-backlog-title" level={2}>
          Backlogs
        </Title>
        <BacklogModal />
      </div>
      <List dataSource={backlogs} renderItem={renderBacklogCards} />
    </div>
  );
}

export default ProjectBacklog;
