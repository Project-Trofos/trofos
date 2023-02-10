import React from 'react';
import { useParams } from 'react-router-dom';
import { Typography } from 'antd';
import { useGetBacklogsByProjectIdQuery } from '../api/backlog';
import BacklogCreationModal from '../components/modals/BacklogCreationModal';
import BacklogList from '../components/lists/BacklogList';
import './ProjectBacklogs.css';

function ProjectBacklog(): JSX.Element {
  const { Title } = Typography;

  const params = useParams();
  const projectId = Number(params.projectId);

  const { data: backlogs } = useGetBacklogsByProjectIdQuery(projectId);

  return (
    <div className="project-backlog-container">
      <div className="project-backlog-title-container">
        <Title className="project-backlog-title" level={2}>
          Backlogs
        </Title>
        <BacklogCreationModal />
      </div>
      <BacklogList backlogs={backlogs} />
    </div>
  );
}

export default ProjectBacklog;
