import React, { useCallback } from 'react';
import { Alert } from 'antd';
import { useParams } from 'react-router-dom';
import trofosApiSlice from '../api';
import { UpdateType } from '../api/socket/socket';
import useSocket from '../api/socket/useSocket';
import { RetrospectiveType } from '../api/types';
import store from '../app/store';
import RetrospectiveContainerCard from '../components/cards/RetrospectiveContainerCard';
import './Retrospective.css';

export default function Retrospective(): JSX.Element {
  const params = useParams();
  const sprintId = Number(params.sprintId);

  // Refetch retrospectives of 'type'
  const handleReset = useCallback((type?: string) => {
    store.dispatch(trofosApiSlice.util.invalidateTags([{ type: 'Retrospective', id: `${sprintId}-${type}` }]));
  }, []);

  useSocket(UpdateType.RETRO, sprintId.toString(), handleReset);

  if (!sprintId) {
    return <Alert message="Sprint does not exist" type="warning" />;
  }

  return (
    <div className="retrospective-container">
      <RetrospectiveContainerCard title="What went well?" type={RetrospectiveType.POSITIVE} sprintId={sprintId} />
      <RetrospectiveContainerCard
        title="What could we improve?"
        type={RetrospectiveType.NEGATIVE}
        sprintId={sprintId}
      />
      <RetrospectiveContainerCard title="Actions for next sprint" type={RetrospectiveType.ACTION} sprintId={sprintId} />
    </div>
  );
}
