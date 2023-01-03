import React from 'react';
import { Card } from 'antd';
import { Backlog } from '../../api/backlog';
import { UserData } from '../../api/types';
import BacklogCardSummary from '../fields/BacklogCardSummary';
import BacklogCardStatus from '../dropdowns/BacklogCardStatus';
import BacklogCardType from '../dropdowns/BacklogCardType';
import BacklogCardPriority from '../dropdowns/BacklogCardPriority';
import BacklogCardAssignee from '../dropdowns/BacklogCardAssignee';
import BacklogCardPoints from '../fields/BacklogCardPoints';
import './ScrumBoardCard.css';

function ScrumBoardCard(props: { backlog: Backlog; users?: UserData[]; projectKey: string | null | undefined }) {
  const { backlog, users, projectKey } = props;

  return (
    <Card className="scrum-board-card-container">
      <BacklogCardSummary backlogId={backlog.backlog_id} currentSummary={backlog.summary} />
      <div className="scrum-board-card-details">
        <div className="backlog-card-id">
          {projectKey ? `${projectKey}-` : ''}
          {backlog.backlog_id}
        </div>
        <BacklogCardType backlogId={backlog.backlog_id} currentType={backlog.type} />
        <BacklogCardPoints backlogId={backlog.backlog_id} currentPoints={backlog.points} />
        <BacklogCardPriority backlogId={backlog.backlog_id} currentPriority={backlog.priority} />
        <BacklogCardAssignee
          backlogId={backlog.backlog_id}
          currentAssignee={backlog.assignee_id}
          projectUsers={users}
        />
      </div>
    </Card>
  );
}

export default ScrumBoardCard;
