import React from 'react';
import { Button, Card, message } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined, DeleteOutlined } from '@ant-design/icons';
import { isEqual } from 'lodash';
import {
  useAddRetrospectiveVoteMutation,
  useDeleteRetrospectiveVoteMutation,
  useUpdateRetrospectiveVoteMutation,
  useDeleteRetrospectiveMutation,
} from '../../api/socket/retrospectiveHooks';
import { Retrospective, RetrospectiveType, RetrospectiveVoteType } from '../../api/types';
import './RetrospectiveContentCard.css';
import { getErrorMessage } from '../../helpers/error';
import { confirmDeleteRetrospective } from '../modals/confirm';
import BacklogCreationModal from '../modals/BacklogCreationModal';
import { useGetUserInfoQuery } from '../../api/auth';

function RetrospectiveContentCard(props: RetrospectiveContentCardProps): JSX.Element {
  const { retroEntry, readOnly } = props;
  const [addRetrospectiveVote] = useAddRetrospectiveVoteMutation();
  const [updateRetrospectiveVote] = useUpdateRetrospectiveVoteMutation();
  const [deleteRetrospectiveVote] = useDeleteRetrospectiveVoteMutation();
  const [deleteRetrospective] = useDeleteRetrospectiveMutation();
  const { data: userInfo } = useGetUserInfoQuery();

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

  const handleDelete = async () => {
    try {
      confirmDeleteRetrospective(async () => {
        await deleteRetrospective({
          retroId: retroEntry.id,
          sprintId: retroEntry.sprint_id,
          retroType: retroEntry.type,
        }).unwrap();
      });
    } catch (err) {
      message.error(getErrorMessage(err));
    }
  };

  return (
    <Card className="retrospective-content-card">
      <div className="retrospective-content-body">
        <div className="vote-container">
          <Button
            onClick={() => handleVoteClick(RetrospectiveVoteType.UP)}
            className={`up ${currentVote === RetrospectiveVoteType.UP ? 'is-selected' : ''}`}
            disabled={readOnly}
          >
            <ArrowUpOutlined />
          </Button>
          <span className="vote-count">{retroEntry.score}</span>
          <Button
            onClick={() => handleVoteClick(RetrospectiveVoteType.DOWN)}
            className={`down ${currentVote === RetrospectiveVoteType.DOWN ? 'is-selected' : ''}`}
            disabled={readOnly}
          >
            <ArrowDownOutlined />
          </Button>
        </div>
        <div className="retrospective-content-text">{retroEntry.content}</div>
        <div
          className={`retrospective-content-delete-container${
            retroEntry && retroEntry.type == RetrospectiveType.ACTION ? '-create' : ''
          }`}
        >
          <Button onClick={() => handleDelete()} className={'delete'} disabled={readOnly}>
            <DeleteOutlined />
          </Button>
          {retroEntry && retroEntry.type == RetrospectiveType.ACTION ? (
            <BacklogCreationModal
              title={'create'}
              modalKey={retroEntry.id}
              defaultBacklog={{
                reporter_id: userInfo?.userId ?? undefined,
                summary: retroEntry.content ?? undefined,
                points: 2,
                type: 'task',
                priority: 'medium',
              }}
              disabled={retroEntry.is_action_taken}
              retrospective={retroEntry}
            />
          ) : (
            <></>
          )}
        </div>
      </div>
    </Card>
  );
}

type RetrospectiveContentCardProps = {
  retroEntry: Retrospective;
  readOnly?: boolean;
};

export default React.memo(RetrospectiveContentCard, (prevRetro, currRetro) => isEqual(prevRetro, currRetro));
