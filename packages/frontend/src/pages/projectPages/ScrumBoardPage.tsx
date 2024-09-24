import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Carousel, Spin } from 'antd';
import { Sprint, useGetActiveSprintQuery, useGetSprintsByProjectIdQuery } from '../../api/sprint';
import Container from '../../components/layouts/Container';
import ScrumBoard from '../../components/board/ScrumBoard';
import { Heading } from '../../components/typography';

import './ScrumBoardPage.css';
import BacklogCreationModal from '../../components/modals/BacklogCreationModal';
import { useGetStandUpHeadersByProjectIdQuery, useGetStandUpQuery } from '../../api/standup';
import StandUpBoard from '../../components/board/StandUpBoard';
import store from '../../app/store';
import trofosApiSlice from '../../api';
import useSocket from '../../api/socket/useSocket';
import { UpdateType } from '../../api/socket/socket';
import { useProjectIdParam } from '../../api/hooks';

const getSprintHeading = (sprint: Sprint | undefined, activeSprint: Sprint | undefined): string | undefined => {
  if (!sprint) {
    return undefined;
  }
  if (!activeSprint || activeSprint.id != sprint.id) {
    return sprint.name;
  }
  return `${sprint.name} (Active)`;
};

export default function ActiveScrumBoardPage(): JSX.Element {
  const projectId = useProjectIdParam();
  const { data: activeSprint, isLoading: isLoadingActiveSprint } = useGetActiveSprintQuery(projectId);
  const { data: standUps, isLoading: isLoadingStandUpHeaders } = useGetStandUpHeadersByProjectIdQuery(projectId);
  const [todaysStandUpId, setTodaysStandUpId] = useState<number | undefined>(undefined);
  const { data: todaysStandUp, isLoading: isLoadingStandUp } = useGetStandUpQuery(
    { id: todaysStandUpId! }, 
    { skip: todaysStandUpId === undefined } // Skip the query if there's no standupId
  );
  
  // Refetch active standup data upon update
  const handleReset = useCallback(() => {
    store.dispatch(trofosApiSlice.util.invalidateTags([{ type: 'StandUp', id: todaysStandUpId }]));
  }, [todaysStandUpId]);
  useSocket(UpdateType.STAND_UP_NOTES, todaysStandUpId?.toString(), handleReset);

  const renderBody = () => {
    return (
      //<Carousel arrows draggable={false}>
      <>
        {activeSprint ? (
        <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
          <ScrumBoard projectId={projectId} sprint={activeSprint} standUp={todaysStandUp}/>
        </div>
      ) : null}
      {todaysStandUp ? (
        <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
          <StandUpBoard standUp={todaysStandUp} />
        </div>
      ) : null}
      </>
      //</></Carousel>
    );
  }

  useEffect(() => {
    if (standUps && standUps.length > 0) {
      const isSameDay = (date1: Date, date2: Date) => (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
      );
  
      const todaysStandup = standUps?.find((s) => isSameDay(new Date(s.date), new Date()));
      setTodaysStandUpId(todaysStandup?.id);
    }
  }, [standUps]);

  if (isLoadingActiveSprint || isLoadingStandUpHeaders || isLoadingStandUp) {
    return <Spin />;
  }

  return (
    <Container noGap fullWidth className="scrum-board-container">
      <div className="scrum-board-header">
        <Heading style={{ marginLeft: '10px', marginTop: '0px', marginBottom: '0px' }}>
          {getSprintHeading(activeSprint, activeSprint)}
        </Heading>
        {activeSprint && <BacklogCreationModal fixedSprint={activeSprint} title={'Create Backlog For This Sprint'} />}
      </div>
      {renderBody()}
    </Container>
  );
}

export function SprintScrumBoardPage(): JSX.Element {
  const params = useParams();
  const projectId = Number(params.projectId);
  const sprintId = Number(params.sprintId);
  const { data: sprints } = useGetSprintsByProjectIdQuery(projectId);
  const sprint = sprints?.sprints.find((s) => s.id === sprintId);

  return (
    <Container noGap fullWidth className="scrum-board-container">
      <Heading style={{ marginLeft: '10px' }}>{getSprintHeading(sprint, undefined)}</Heading>
      <ScrumBoard projectId={projectId} sprint={sprint} />
    </Container>
  );
}
