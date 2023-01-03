import React from 'react';
import { useParams } from 'react-router-dom';
import { Backlog } from '../api/backlog';
import { useGetBacklogStatusQuery, useGetProjectQuery } from '../api/project';
import { useGetActiveSprintQuery } from '../api/sprint';
import ScrumBoardCard from '../components/cards/ScrumBoardCard';

export default function ScrumBoard(): JSX.Element {
  const params = useParams();
  const projectId = Number(params.projectId);
  const { data: activeSprint } = useGetActiveSprintQuery(projectId);
  const { data: backlogStatus } = useGetBacklogStatusQuery({ id: projectId });
  const { data: projectData } = useGetProjectQuery({ id: projectId });

  const processBacklogs = (backlogs?: Backlog[]) => {
    if (!backlogs) {
      return undefined;
    }

    return [...backlogs].sort((b1, b2) => b1.backlog_id - b2.backlog_id);
  };

  const backlogs = processBacklogs(activeSprint?.backlogs);

  return (
    <div>
      {backlogs?.map((backlog) => (
        <ScrumBoardCard
          key={backlog.backlog_id}
          backlog={backlog}
          users={projectData?.users}
          projectKey={projectData?.pkey}
        />
      ))}
    </div>
  );
}
