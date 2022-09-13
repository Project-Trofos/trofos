import React from 'react';
import type { Backlog } from '../../api/backlog';
import './BacklogCard.css';

function BacklogCard(props: BacklogCardProps): JSX.Element {
  const { backlog } = props;
  return (
    <>
      <div>{backlog.id}</div>
      <div className="backlog-card-summary">{backlog.summary}</div>
      <div>{backlog.type}</div>
      <div>{backlog.priority}</div>
      <div>{backlog.assignee_id}</div>
      <div>{backlog.points}</div>
    </>
  );
}

type BacklogCardProps = {
  backlog: Backlog;
};

export default BacklogCard;
