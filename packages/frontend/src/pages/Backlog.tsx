import React from 'react';
import { useParams } from 'react-router-dom';
import { useGetBacklogQuery } from '../api/backlog';

function Backlog(): JSX.Element {
  const params = useParams();

  const projectId = Number(params.projectId);
  const backlogId = Number(params.backlogId);
  const { data: backlog } = useGetBacklogQuery({ projectId, backlogId });

  console.log('backlog:', backlog);

  if (!backlog) {
    return <h1>Unable to get backlog. Please try again.</h1>;
  }

  return (
    <div>
      <div>
        <h2>{backlog.summary}</h2>
        <p>{backlog.description}</p>
      </div>
    </div>
  );
}

export default Backlog;
