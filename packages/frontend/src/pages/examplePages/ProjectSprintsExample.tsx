import { List, Typography } from 'antd';
import { DragDropContext } from 'react-beautiful-dnd';
import type { Sprint } from '../../api/sprint';
import { Epic } from '../../api/types';
import SprintCreationModal from '../../components/modals/SprintCreationModal';
import SprintListingCard from '../../components/cards/SprintListingCard';
import BacklogCreationModal from '../../components/modals/BacklogCreationModal';
import EpicCreationModal from '../../components/modals/EpicCreationModal';
import { GENERIC_NEW_SPRINT } from '../../helpers/sprintCreationHelper';
import StrictModeDroppable from '../../components/dnd/StrictModeDroppable';
import GenericBoxWithBackground from '../../components/layouts/GenericBoxWithBackground';
import BacklogList from '../../components/lists/BacklogList';
import EpicListingCard from '../../components/cards/EpicListingCard';
import { exampleBacklog, exampleSprints } from './example';

const { Title } = Typography;

export default function ProjectSprintsExample(): JSX.Element {
  const sprints = exampleSprints;
  const backlogs = exampleBacklog;

  const renderSprintListingCards = (sprint: Sprint) => (
    <List.Item className="sprint-card-container">
      <SprintListingCard sprint={sprint} setSprint={() => {}} setIsModalVisible={() => {}} disableClickEvent={true} />
    </List.Item>
  );

  const renderEpicListingCards = (epic: Epic) => (
    <List.Item className="epic-card-container">
      <EpicListingCard epic={epic} />
    </List.Item>
  );

  return (
    <GenericBoxWithBackground>
      <div className="project-sprint-title-container">
        <Title className="project-sprint-title" level={2}>
          Sprints
        </Title>
        <SprintCreationModal
          isModalVisible={false}
          setIsModalVisible={() => {}}
          setSprint={() => {}}
          latestSprint={GENERIC_NEW_SPRINT}
        />
        <BacklogCreationModal disableClickEvent={true} />
        <EpicCreationModal disableClickEvent={true} />
      </div>
      <DragDropContext onDragEnd={() => {}}>
        <div className="sprint-list">
          <Title level={5}>Current Sprints:</Title>
          <List
            dataSource={sprints?.filter((sprint) => sprint.status === 'current')}
            renderItem={renderSprintListingCards}
          />
        </div>
        <div className="sprint-list">
          <Title level={5}>Upcoming Sprints:</Title>
          <List
            dataSource={sprints?.filter((sprint) => sprint.status === 'upcoming')}
            renderItem={renderSprintListingCards}
          />
        </div>
        <div className="sprint-list">
          <Title level={5}>Unassigned Backlogs:</Title>
          <StrictModeDroppable droppableId="null">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                <BacklogList backlogs={backlogs} />
                {provided.placeholder}
              </div>
            )}
          </StrictModeDroppable>
        </div>
        <div className="sprint-list">
          <Title level={5}>Completed Sprints:</Title>
          <List
            dataSource={sprints?.filter((sprint) => sprint.status === 'completed' || sprint.status === 'closed')}
            renderItem={renderSprintListingCards}
          />
        </div>
      </DragDropContext>
      <div className="epic-list">
        <Title level={5}>Epics:</Title>
        <List renderItem={renderEpicListingCards} />
      </div>
    </GenericBoxWithBackground>
  );
}
