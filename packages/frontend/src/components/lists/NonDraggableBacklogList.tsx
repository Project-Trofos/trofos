import React from 'react';
import { List } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import BacklogListingCard from '../cards/BacklogListingCard';
import type { Backlog } from '../../api/types';
import { useGetProjectQuery } from '../../api/project';
import { sortBacklogs } from '../../helpers/sortBacklogs';
import './NonDraggableBacklogList.css';

function NonDraggableBacklogList(props: { backlogs: Backlog[] | undefined }): JSX.Element {
  const { backlogs } = props;
  const params = useParams();
  const navigate = useNavigate();
  const projectId = Number(params.projectId);

  const { data: projectData } = useGetProjectQuery({ id: projectId });

  const handleBacklogOnClick = (backlogId: number) => {
    navigate(`/project/${params.projectId}/backlog/${backlogId}`);
  };

  const renderBacklogListingCards = (backlog: Backlog, index: number) => (
    <List.Item
      key={backlog.backlog_id}
      className="backlog-card-container"
      onClick={() => handleBacklogOnClick(backlog.backlog_id)}
    >
      <div className="backlog-listing-card-container">
        <BacklogListingCard backlog={backlog} projectKey={projectData?.pkey} users={projectData?.users} />
      </div>
    </List.Item>
  );

  return <List dataSource={sortBacklogs(backlogs)} renderItem={renderBacklogListingCards} />;
}

export default NonDraggableBacklogList;
