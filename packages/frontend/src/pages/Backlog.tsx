import React from 'react';
import { useParams } from 'react-router-dom';
import { useGetBacklogQuery } from '../api/backlog';

function Backlog(): JSX.Element {
  const params = useParams();

	const projectId = Number(params.projectId)
  const backlogId = Number(params.backlogId);
  const { data: backlog } = useGetBacklogQuery({projectId, backlogId});

  console.log('backlog:', backlog);

  return <div>Test {backlogId}</div>;
}

export default Backlog;
