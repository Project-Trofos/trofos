import React from 'react';
import { Card, Dropdown, message } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { isEqual } from 'lodash';
import { UserAvatar } from '../avatar/UserAvatar';
import type { Backlog } from '../../api/types';
import { draggableWrapper } from '../../helpers/dragAndDrop';
import { BACKLOG_PRIORITY_OPTIONS } from '../../helpers/constants';
import './ScrumBoardCard.css';
import { MenuProps } from 'antd/lib';
import { COLUMN_MAPPING } from '../board/StandUpBoard/StandUpBoard';
import { useAddStandUpNoteMutation } from '../../api/socket/standUpHooks';
import { StandUp } from '../../api/standup';

type ScrumBoardCardProps = {
  backlog: Backlog;
  projectKey: string | null | undefined;
  standUp?: StandUp;
};

function Component({ backlog, projectKey, standUp }: ScrumBoardCardProps) {
  const navigate = useNavigate();
  const params = useParams();
  const [addStandUpNote] = useAddStandUpNoteMutation();

  const canAddToStandUpBoard = backlog.assignee !== null && backlog.assignee?.user_id !== undefined && standUp !== undefined;

  const onClickBacklogMenuItem: MenuProps['onClick'] = async (e) => {
    e.domEvent.stopPropagation(); // Stop the menu item click from bubbling up to the card
    if (!canAddToStandUpBoard) {
      message.error("Cannot perform action on unassigned backlog");
      return;
    }
    const userId = backlog.assignee;
    try {
      await addStandUpNote({
        project_id: backlog.project_id,
        standUpNote: {
          stand_up_id: standUp.id,
          content: backlog.summary,
          column_id: Number(e.key),
          user_id: userId!.user_id,
        }
      }).unwrap();
      message.success("Added in standup board");
    } catch (err) {
      console.error(err);
    }
  };

  const backlogMenuItems: MenuProps['items']= [
    {
      key: COLUMN_MAPPING.DONE,
      label: 'Mark as Done in Standup'
    },
    {
      key: COLUMN_MAPPING.NEXT,
      label: 'Mark as Next in Standup'
    },
    {
      key: COLUMN_MAPPING.BLOCKERS,
      label: 'Mark as Blockers in Standup'
    }
  ];

  const actions: React.ReactNode[] = [
    (<Dropdown key="ellipsis" menu={{items: backlogMenuItems, onClick: onClickBacklogMenuItem}}>
      <SettingOutlined onClick={(e) => e.stopPropagation()}/>
    </Dropdown>),
  ];

  return (
    <Card
      className="scrum-board-card-container"
      onClick={() => navigate(`/project/${params.projectId}/backlog/${backlog.backlog_id}`)}
      actions={canAddToStandUpBoard ? actions: undefined}
    >
      <div className="scrum-board-card-summary">{backlog.summary}</div>
      <div className="scrum-board-card-details">
        <div className="backlog-card-id">
          {projectKey ? `${projectKey}-` : ''}
          {backlog.backlog_id}
        </div>
        <div className="scrum-board-card-type">{backlog.type}</div>
        <div className={`scrum-board-card-points ${backlog.points ? 'points-active' : ''}`}>{backlog.points}</div>
        <div className={`scrum-board-card-priority ${backlog.priority}-priority`}>
          {BACKLOG_PRIORITY_OPTIONS.find((v) => v.value == backlog.priority)?.label}
        </div>
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
        {backlog.epic_id && (
          <div className="scrum-board-card-assignee">
            <UserAvatar
              tooltip
              className="assignee-avatar"
              size="small"
              userHashString={backlog.epic?.name ?? 'epic'}
              userDisplayName={backlog.epic?.name ?? 'epic'}
            />
          </div>
        )}
      </div>
    </Card>
  );
}

const ScrumBoardCard = React.memo(draggableWrapper(Component), (prevProps, currProps) => isEqual(prevProps, currProps));
const ReadOnlyScrumBoardCard = React.memo(Component, (prevProps, currProps) => isEqual(prevProps, currProps));

export { ScrumBoardCard, ReadOnlyScrumBoardCard };
