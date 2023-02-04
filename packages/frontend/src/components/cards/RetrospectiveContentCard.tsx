import React from 'react';
import { Button, Card } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import {
  useAddRetrospectiveVoteMutation,
  useDeleteRetrospectiveVoteMutation,
  useUpdateRetrospectiveVoteMutation,
} from '../../api/socket/retrospectiveHooks';
import { Retrospective, RetrospectiveVoteType } from '../../api/types';
import './RetrospectiveContentCard.css';

export default function RetrospectiveContentCard(props: RetrospectiveContentCardProps): JSX.Element {
  const { retroEntry } = props;
  const [addRetrospectiveVote] = useAddRetrospectiveVoteMutation();
  const [updateRetrospectiveVote] = useUpdateRetrospectiveVoteMutation();
  const [deleteRetrospectiveVote] = useDeleteRetrospectiveVoteMutation();

  const getCurrentVote = (): RetrospectiveVoteType => {
    return retroEntry.votes?.[0]?.type || null;
  };

  const currentVote = getCurrentVote();

  const handleVoteClick = async (vote: RetrospectiveVoteType) => {
    try {
      if (!currentVote) {
        await addRetrospectiveVote({
          retroId: retroEntry.id,
          type: vote,
          sprintId: retroEntry.sprint_id,
          retroType: retroEntry.type,
        }).unwrap();
      } else if (vote === currentVote) {
        await deleteRetrospectiveVote({
          retroId: retroEntry.id,
          sprintId: retroEntry.sprint_id,
          retroType: retroEntry.type,
        }).unwrap();
      } else {
        await updateRetrospectiveVote({
          retroId: retroEntry.id,
          type: vote,
          sprintId: retroEntry.sprint_id,
          retroType: retroEntry.type,
        }).unwrap();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Card className="retrospective-content-card">
      <div className="retrospective-content-body">
        <div className="vote-container">
          <Button
            onClick={() => handleVoteClick(RetrospectiveVoteType.UP)}
            className={`up ${currentVote === RetrospectiveVoteType.UP ? 'is-selected' : ''}`}
          >
            <ArrowUpOutlined />
          </Button>
          <span className="vote-count">{retroEntry.score}</span>
          <Button
            onClick={() => handleVoteClick(RetrospectiveVoteType.DOWN)}
            className={`down ${currentVote === RetrospectiveVoteType.DOWN ? 'is-selected' : ''}`}
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
