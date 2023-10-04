import React from 'react';
import { Card } from 'antd';
import { Draggable } from 'react-beautiful-dnd';
import { useNavigate, useParams } from 'react-router-dom';
import { isEqual } from 'lodash';
import { UserAvatar } from '../avatar/UserAvatar';
import type { Backlog } from '../../api/types';
import './ScrumBoardCard.css';

function ScrumBoardCard(props: { backlog: Backlog; projectKey: string | null | undefined; index: number }) {
  const { backlog, projectKey, index } = props;
  const navigate = useNavigate();
  const params = useParams();

  return (
    <Draggable draggableId={backlog.backlog_id.toString()} index={index}>
      {(provided) => (
        <div
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          onClick={() => navigate(`/project/${params.projectId}/backlog/${backlog.backlog_id}`)}
        >
          <Card className="scrum-board-card-container">
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
                    className="assignee-avatar"
                    size="small"
                    userHashString={backlog.assignee.user.user_email}
                    userDisplayName={backlog.assignee.user.user_display_name}
                  />
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </Draggable>
  );
}

export default React.memo(ScrumBoardCard, (prevProps, currProps) => isEqual(prevProps, currProps));
