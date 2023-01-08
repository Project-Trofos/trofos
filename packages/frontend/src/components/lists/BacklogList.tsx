import React from 'react';
import { List } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import BacklogListingCard from '../cards/BacklogListingCard';
import { Backlog } from '../../api/backlog';
import { useGetProjectQuery } from '../../api/project';
import './BacklogList.css';
import { sortBacklogs } from '../../helpers/sortBacklogs';

function BacklogList(props: { backlogs: Backlog[] | undefined }): JSX.Element {
  const { backlogs } = props;
  const params = useParams();
  const navigate = useNavigate();
  const projectId = Number(params.projectId);

  const { data: projectData } = useGetProjectQuery({ id: projectId });

  const handleBacklogOnClick = (backlogId: number) => {
    navigate(`/project/${params.projectId}/backlog/${backlogId}`);
  };

  const renderBacklogListingCards = (backlog: Backlog) => (
    <List.Item
      key={backlog.backlog_id}
      className="backlog-card-container"
      onClick={() => handleBacklogOnClick(backlog.backlog_id)}
    >
      <BacklogListingCard backlog={backlog} projectKey={projectData?.pkey} users={projectData?.users} />
    </List.Item>
  );

  return <List dataSource={sortBacklogs(backlogs)} renderItem={renderBacklogListingCards} />;
}

export default BacklogList;
