import React, { useCallback, useEffect } from 'react';
import { Alert, Button, Divider } from 'antd';
import trofosApiSlice from '../api';
import { UpdateType } from '../api/socket/socket';
import useSocket from '../api/socket/useSocket';
import { RetrospectiveType } from '../api/types';
import store from '../app/store';
import RetrospectiveContainerCard from '../components/cards/RetrospectiveContainerCard';
import './Retrospective.css';
import { useProjectIdParam, useSprintIdParam } from '../api/hooks';
import GenericBoxWithBackground from '../components/layouts/GenericBoxWithBackground';
import SprintInsightModal from '../components/modals/SprintInsightModal';
import { useGetSprintInsightGeneratingStatusQuery } from '../api/sprint';
import { useGetFeatureFlagsQuery } from '../api/featureFlag';

export default function Retrospective({ sprintId, readOnly }: { sprintId?: number; readOnly?: boolean }): JSX.Element {
  const retrospectiveSprintId = sprintId ?? useSprintIdParam();
  const projectId = useProjectIdParam();
  const { data: insightIsLoading, refetch } = useGetSprintInsightGeneratingStatusQuery({
    sprintId: retrospectiveSprintId,
    projectId,
  });
  const { data: featureFlags, isLoading: isFeatureFlagsLoading } = useGetFeatureFlagsQuery();

  // Refetch retrospectives of 'type'
  const handleReset = useCallback((type?: string) => {
    store.dispatch(
      trofosApiSlice.util.invalidateTags([{ type: 'Retrospective', id: `${retrospectiveSprintId}-${type}` }]),
    );
  }, []);

  const handleInvalidateSprintInsight = useCallback(() => {
    store.dispatch(trofosApiSlice.util.invalidateTags([{ type: 'SprintInsight' }, { type: 'SprintInsightStatus' }]));
  }, [retrospectiveSprintId]);

  useSocket(UpdateType.RETRO, retrospectiveSprintId.toString(), handleReset);

  useSocket(UpdateType.SPRINT_INSIGHT, retrospectiveSprintId.toString(), handleInvalidateSprintInsight);

  if (!retrospectiveSprintId) {
    return <Alert message="Sprint does not exist" type="warning" />;
  }

  useEffect(() => {
    refetch();
  }, []);

  return (
    <GenericBoxWithBackground
      style={{ overflowX: 'auto' }}
    >
      {featureFlags?.some((flag) => flag.feature_name === 'ai_insights' && flag.active) && <SprintInsightModal
        sprintId={retrospectiveSprintId}
        isGenerating={insightIsLoading?.isGenerating === undefined ? false : insightIsLoading.isGenerating}
      />}
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
