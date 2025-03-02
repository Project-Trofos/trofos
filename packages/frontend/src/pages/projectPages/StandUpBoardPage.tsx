import React, { useCallback } from 'react';
import StandUpBoard from '../../components/board/StandUpBoard';
import { useParams } from 'react-router-dom';
import { useGetStandUpQuery } from '../../api/standup';
import store from '../../app/store';
import trofosApiSlice from '../../api';
import useSocket from '../../api/socket/useSocket';
import { UpdateType } from '../../api/socket/socket';
import GenericBoxWithBackground from '../../components/layouts/GenericBoxWithBackground';
import LoadingComponent from '../../components/common/LoadingComponent';

export default function StandUpBoardPage(): JSX.Element {
  const params = useParams();
  const standUpId = Number(params.standUpId);
  const projectId = Number(params.projectId);
  const { data: standUp, isLoading } = useGetStandUpQuery({ 
    project_id: projectId,
    id: {id: standUpId}
  });

  // Refetch active standup data upon update
  const handleReset = useCallback(() => {
    store.dispatch(trofosApiSlice.util.invalidateTags([{ type: 'StandUp', id: standUpId }]));
  }, [standUpId]);
  useSocket(UpdateType.STAND_UP_NOTES, standUpId.toString(), handleReset);

  if (isLoading) {
    return <LoadingComponent />;
  }
  if (!standUp) {
    return <div>Stand Up not found</div>;
  }
  return (
    <GenericBoxWithBackground>
      <StandUpBoard standUp={standUp} />
    </GenericBoxWithBackground>
  );
}
