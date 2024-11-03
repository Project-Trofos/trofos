import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Space, Spin, Tabs } from 'antd';
import type { TabsProps } from 'antd';
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
import StandUpCreationModal from '../../components/modals/StandUpCreationModal';
import LiveEditor from '../../components/editor/LiveEditor';

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
    { project_id: projectId, id: {id: todaysStandUpId!} }, 
    { skip: todaysStandUpId === undefined } // Skip the query if there's no standupId
  );
  // Refetch active standup data upon update
  const handleReset = useCallback(() => {
    store.dispatch(trofosApiSlice.util.invalidateTags([{ type: 'StandUp', id: todaysStandUpId }]));
  }, [todaysStandUpId]);
  useSocket(UpdateType.STAND_UP_NOTES, todaysStandUpId?.toString(), handleReset);

  const tabs: TabsProps['items'] = [
    {
      key: 'scrum-board',
      label: 'Scrum Board',
      children: <ScrumBoard projectId={projectId} sprint={activeSprint} standUp={todaysStandUp}/>
    },
    ...(todaysStandUp
      ? [
          {
            key: 'stand-up-board',
            label: 'Today\'s Stand Up Board',
            children: <StandUpBoard standUp={todaysStandUp} />,
          },
        ]
      : []),
    {
      key: 'live-notes',
      label: 'Notes',
      children: <LiveEditor sprintId={String(activeSprint?.id)}/>
    }
  ];

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
    <Container noGap className="scrum-board-container">
      <div className="scrum-board-header">
        <Heading style={{ marginLeft: '10px', marginTop: '0px', marginBottom: '0px' }}>
          {getSprintHeading(activeSprint, activeSprint)}
        </Heading>
        {activeSprint && <BacklogCreationModal fixedSprint={activeSprint} title={'Create Backlog For This Sprint'} />}
        {!todaysStandUp && activeSprint && <StandUpCreationModal projectId={projectId} isToday/>}
      </div>
      {<Tabs defaultActiveKey='scrum-board' items={tabs} />}
    </Container>
  );
}

export function SprintScrumBoardPage(): JSX.Element {
  const params = useParams();
  const projectId = Number(params.projectId);
  const sprintId = Number(params.sprintId);
  const { data: sprints } = useGetSprintsByProjectIdQuery(projectId);
  const sprint = sprints?.sprints.find((s) => s.id === sprintId);

  const tabs: TabsProps['items'] = [
    {
      key: 'scrum-board',
      label: 'Scrum Board',
      children: <ScrumBoard projectId={projectId} sprint={sprint} />
    },
    {
      key: 'live-notes',
      label: 'Notes',
      children: <LiveEditor sprintId={String(sprint?.id)}/>
    }
  ];

  return (
    <Container noGap fullWidth className="scrum-board-container">
      <Heading style={{ marginLeft: '10px' }}>{getSprintHeading(sprint, undefined)}</Heading>
      {<Tabs defaultActiveKey='scrum-board' items={tabs} />}
    </Container>
  );
}
