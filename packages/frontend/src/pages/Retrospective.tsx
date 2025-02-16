import React, { useCallback } from 'react';
import { Alert, Button, Divider } from 'antd';
import trofosApiSlice from '../api';
import { UpdateType } from '../api/socket/socket';
import useSocket from '../api/socket/useSocket';
import { RetrospectiveType } from '../api/types';
import store from '../app/store';
import RetrospectiveContainerCard from '../components/cards/RetrospectiveContainerCard';
import './Retrospective.css';
import { useSprintIdParam } from '../api/hooks';
import GenericBoxWithBackground from '../components/layouts/GenericBoxWithBackground';
import SprintInsightModal from '../components/modals/SprintInsightModal';

export default function Retrospective({ sprintId, readOnly }: { sprintId?: number; readOnly?: boolean }): JSX.Element {
  const retrospectiveSprintId = sprintId ?? useSprintIdParam();

  // Refetch retrospectives of 'type'
  const handleReset = useCallback((type?: string) => {
    store.dispatch(
      trofosApiSlice.util.invalidateTags([{ type: 'Retrospective', id: `${retrospectiveSprintId}-${type}` }]),
    );
  }, []);

  useSocket(UpdateType.RETRO, retrospectiveSprintId.toString(), handleReset);

  if (!retrospectiveSprintId) {
    return <Alert message="Sprint does not exist" type="warning" />;
  }

  return (
    <GenericBoxWithBackground
      style={{ overflowX: 'auto' }}
    >
      <SprintInsightModal sprintId={retrospectiveSprintId}/>
      <Divider />
      <div className="retrospective-container">
        <RetrospectiveContainerCard
          title="What went well?"
          readOnly={readOnly}
          type={RetrospectiveType.POSITIVE}
          sprintId={retrospectiveSprintId}
        />
        <RetrospectiveContainerCard
          readOnly={readOnly}
          title="What could we improve?"
          type={RetrospectiveType.NEGATIVE}
          sprintId={retrospectiveSprintId}
        />
        <RetrospectiveContainerCard
          readOnly={readOnly}
          title="Actions for next sprint"
          type={RetrospectiveType.ACTION}
          sprintId={retrospectiveSprintId}
        />
      </div>
    </GenericBoxWithBackground>
  );
}
