import React from 'react';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { Button, Card } from 'antd';
import { useGetUserInfoQuery } from '../../api/auth';
import { Retrospective, RetrospectiveVotes } from '../../api/types';
import './RetrospectiveContentCard.css';

export default function RetrospectiveContentCard(props: RetrospectiveContentCardProps): JSX.Element {
  const { retroEntry } = props;
  const { data: userInfo } = useGetUserInfoQuery();

  const getCurrentVote = () => {
    return retroEntry.votes?.[0]?.type || null;
  };

  const currentVote = getCurrentVote();

  const handleVoteClick = (vote: string) => {
    if (vote === currentVote) {
      console.log('undo');
    } else {
      console.log(vote);
    }
  };

  return (
    <Card className="retrospective-content-card">
      <div className="retrospective-content-body">
        <div className="vote-container">
          <Button onClick={() => handleVoteClick('up')} className={`up ${currentVote === 'up' ? 'is-selected' : ''}`}>
            <ArrowUpOutlined />
          </Button>
          <span className="vote-count">{retroEntry.score}</span>
          <Button
            onClick={() => handleVoteClick('down')}
            className={`down ${currentVote === 'down' ? 'is-selected' : ''}`}
          >
            <ArrowDownOutlined />
          </Button>
        </div>
        <div className="retrospective-content-text">{retroEntry.content}</div>
      </div>
    </Card>
  );
}

type RetrospectiveContentCardProps = {
  retroEntry: Retrospective;
};
