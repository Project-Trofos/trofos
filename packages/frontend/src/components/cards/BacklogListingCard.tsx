import React from 'react';
import type { Backlog } from '../../api/types';
import { UserData } from '../../api/types';
import BacklogCardStatus from '../dropdowns/BacklogCardStatus';
import BacklogCardType from '../dropdowns/BacklogCardType';
import BacklogCardPriority from '../dropdowns/BacklogCardPriority';
import BacklogCardAssignee from '../dropdowns/BacklogCardAssignee';
import BacklogCardPoints from '../fields/BacklogCardPoints';
import BacklogCardSummary from '../fields/BacklogCardSummary';
import './BacklogListingCard.css';

function BacklogListingCard(props: BacklogListingCardProps): JSX.Element {
  const { backlog, projectKey, users } = props;

  return (
    <>
      <div className="backlog-card-id">
        {projectKey ? `${projectKey}-` : ''}
        {backlog.backlog_id}
      </div>
      <BacklogCardSummary backlogId={backlog.backlog_id} currentSummary={backlog.summary} />
      <BacklogCardStatus backlogId={backlog.backlog_id} currentStatus={backlog.status} />
      <BacklogCardType backlogId={backlog.backlog_id} currentType={backlog.type} />
      <BacklogCardPriority backlogId={backlog.backlog_id} currentPriority={backlog.priority} />
      <BacklogCardAssignee backlogId={backlog.backlog_id} currentAssignee={backlog.assignee_id} projectUsers={users} />
      <BacklogCardPoints backlogId={backlog.backlog_id} currentPoints={backlog.points} />
    </>
  );
}

type BacklogListingCardProps = {
  backlog: Backlog;
  projectKey: string | null | undefined;
  users?: UserData[];
};

export default BacklogListingCard;
