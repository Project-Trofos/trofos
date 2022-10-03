import { UserOutlined } from '@ant-design/icons';
import { Avatar } from 'antd';
import React from 'react';
import type { Backlog } from '../../api/backlog';
import './BacklogListingCard.css';

function BacklogListingCard(props: BacklogListingCardProps): JSX.Element {
  const { backlog } = props;

  const renderAssignee = (assigneeId: number): JSX.Element => (
    <div>
      <Avatar className="assignee-avatar" style={{ backgroundColor: '#85041C' }} icon={<UserOutlined />} />
      <span>{assigneeId === 1 ? 'User1' : 'User2'}</span>
    </div>
  );

  // eslint-disable-next-line consistent-return
  const renderPriority = (priority: BacklogPriority): JSX.Element => {
    switch (priority) {
      case 'very_high':
      case 'high':
        return <div className="backlog-card-high-priority">{backlog.priority}</div>;
      case 'medium':
        return <div className="backlog-card-medium-priority">{backlog.priority}</div>;
      case 'low':
      case 'very_low':
        return <div className="backlog-card-low-priority">{backlog.priority}</div>;
    }
  };

  return (
    <>
      <div>{backlog.id}</div>
      <div className="backlog-card-summary">{backlog.summary}</div>
      <div>{backlog.type}</div>
      {backlog.priority && renderPriority(backlog.priority)}
      {backlog.assignee_id && renderAssignee(backlog.assignee_id)}
      {backlog.points && <div className="backlog-card-points">{backlog.points}</div>}
    </>
  );
}

type BacklogListingCardProps = {
  backlog: Backlog;
};

type BacklogPriority = 'very_high' | 'high' | 'medium' | 'low' | 'very_low';

export default BacklogListingCard;
