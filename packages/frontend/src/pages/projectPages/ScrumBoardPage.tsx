import React from 'react';
import { useParams } from 'react-router-dom';
import { Sprint, useGetActiveSprintQuery, useGetSprintsByProjectIdQuery } from '../../api/sprint';
import Container from '../../components/layouts/Container';
import { Heading, Subheading } from '../../components/typography';

import './ScrumBoardPage.css';
import BacklogCreationModal from '../../components/modals/BacklogCreationModal';
import ScrumBoardParent from '../../components/board/ScrumBoard/ScrumBoardParent';

const getSprintHeading = (sprint: Sprint | undefined, activeSprint: Sprint | undefined): string | undefined => {
  if (!sprint) {
    return undefined;
  }
  if (!activeSprint || activeSprint.id != sprint.id) {
    return sprint.name;
  }
  return `${sprint.name} (Active)`;
};

const getSprintSubheading = (sprint: Sprint | undefined): string | undefined => {
  if (!sprint) {
    return undefined;
  }
  return `Goals: ${sprint.goals}`;
}

export default function ActiveScrumBoardPage(): JSX.Element {
  const params = useParams();
  const projectId = Number(params.projectId);
  const { data: activeSprint } = useGetActiveSprintQuery(projectId);

  return (
    <Container noGap fullWidth className="scrum-board-container">
      <div className="scrum-board-header">
        <Heading style={{ marginLeft: '10px', marginTop: '0px', marginBottom: '0px' }}>
          {getSprintHeading(activeSprint, activeSprint)}
        </Heading>
        {activeSprint && <BacklogCreationModal fixedSprint={activeSprint} title={'Create Backlog For This Sprint'} />}
      </div>
      <div className='scrum-board-subheader'>
        <Subheading style={{ marginLeft: '10px', color: 'grey' }}>
          {getSprintSubheading(activeSprint)}
        </Subheading>
        </div>
      <ScrumBoardParent projectId={projectId} sprint={activeSprint} />
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
      <Subheading style={{ marginLeft: '10px', color: 'grey' }}>
        {getSprintSubheading(sprint)}
      </Subheading>
      <ScrumBoardParent projectId={projectId} sprint={sprint} />
    </Container>
  );
}
