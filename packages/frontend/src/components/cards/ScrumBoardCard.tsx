import React from 'react';
import { Card } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { isEqual } from 'lodash';
import { UserAvatar } from '../avatar/UserAvatar';
import type { Backlog } from '../../api/types';
import { draggableWrapper } from '../../helpers/dragAndDrop';
import './ScrumBoardCard.css';

type ScrumBoardCardProps = { backlog: Backlog; projectKey: string | null | undefined };

function Component({ backlog, projectKey }: ScrumBoardCardProps) {
  const navigate = useNavigate();
  const params = useParams();

  return (
    <Card
      className="scrum-board-card-container"
      onClick={() => navigate(`/project/${params.projectId}/backlog/${backlog.backlog_id}`)}
    >
      <div className="scrum-board-card-summary">{backlog.summary}</div>
      <div className="scrum-board-card-details">
        <div className="backlog-card-id">
          {projectKey ? `${projectKey}-` : ''}
          {backlog.backlog_id}
        </div>
        <div className="scrum-board-card-type">{backlog.type}</div>
        <div className={`scrum-board-card-points ${backlog.points ? 'points-active' : ''}`}>{backlog.points}</div>
        <div className={`scrum-board-card-priority ${backlog.priority}-priority`}>{backlog.priority}</div>
        <div className="scrum-board-card-assignee">
          {backlog.assignee && (
            <UserAvatar
              tooltip
              className="assignee-avatar"
              size="small"
              userHashString={backlog.assignee.user.user_email}
              userDisplayName={backlog.assignee.user.user_display_name}
            />
          )}
        </div>
      </div>
    </Card>
  );
}

const ScrumBoardCard = React.memo(draggableWrapper(Component), (prevProps, currProps) => isEqual(prevProps, currProps));
const ReadOnlyScrumBoardCard = React.memo(Component, (prevProps, currProps) => isEqual(prevProps, currProps));

export { ScrumBoardCard, ReadOnlyScrumBoardCard };
