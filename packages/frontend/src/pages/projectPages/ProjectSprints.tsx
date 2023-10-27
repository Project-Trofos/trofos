import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { List, message, Typography } from 'antd';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { useGetSprintsByProjectIdQuery } from '../../api/sprint';
import { useUpdateBacklogMutation } from '../../api/socket/backlogHooks';
import type { Sprint } from '../../api/sprint';
import SprintCreationModal from '../../components/modals/SprintCreationModal';
import SprintListingCard from '../../components/cards/SprintListingCard';
import type { AutoSprintTypes } from '../../helpers/SprintModal.types';
import BacklogList from '../../components/lists/BacklogList';
import BacklogCreationModal from '../../components/modals/BacklogCreationModal';
import StrictModeDroppable from '../../components/dnd/StrictModeDroppable';
import './ProjectSprints.css';
import Container from '../../components/layouts/Container';

const GENERIC_NEW_SPRINT: AutoSprintTypes = {
  name: 'Sprint 1',
  dates: [dayjs(), dayjs().add(7, 'day')],
  duration: 1,
};

function ProjectSprints(): JSX.Element {
  const params = useParams();
  const { Title } = Typography;

  const [sprintToEdit, setSprintToEdit] = useState<Sprint | undefined>(undefined);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const projectId = Number(params.projectId);
  const { data: sprintsData } = useGetSprintsByProjectIdQuery(projectId);

  const [updateBacklog] = useUpdateBacklogMutation();

  const sortSprintsByStartDate = (s1: Sprint, s2: Sprint) => {
    if (!s1.start_date) {
      return 1;
    }
    if (!s2.start_date) {
      return -1;
    }
    return dayjs(s1.start_date).isAfter(dayjs(s2.start_date)) ? 1 : -1;
  };

  const incrementSprintName = (latestSprintName: string): string => {
    // Get last digit of the name
    const nameTokens: string[] = latestSprintName.split(' ');
    let sprintCount: number = +nameTokens[nameTokens.length - 1];
    if (isNaN(sprintCount)) {
      sprintCount = 2;
    } else {
      // Remove current count from the name if it exists
      nameTokens.pop();
    }
    // Concat latest count to the name
    return `${nameTokens.join(' ')} ${sprintCount + 1}`;
  };

  const incrementSprintDate = (duration: number, dates: string[]): Dayjs[] | undefined => {
    if (!dates[0] || !dates[1]) {
      return undefined;
    }
    if (duration === 0) {
      const startDate = dayjs(dates[0]);
      const endDate = dayjs(dates[1]);
      const currentRange = endDate.diff(startDate, 'day');
      return [endDate, endDate.add(currentRange, 'day')];
    }
    return [dayjs(dates[1]), dayjs(dates[1]).add(duration * 7, 'day')];
  };

  const autoSuggestNewSprint = (latestSprint: Sprint): AutoSprintTypes => {
    // Only works if sprint follows a naming convention with a digit at the back (e.g Sprint 1 or Week 1)
    const newSprintName = incrementSprintName(latestSprint.name);
    const newDates = incrementSprintDate(latestSprint.duration, [latestSprint.start_date, latestSprint.end_date]);
    return {
      name: newSprintName,
      dates: newDates,
      duration: latestSprint.duration,
    };
  };

  const sprints = useMemo(() => {
    const sprintsDataCopy = sprintsData?.sprints ? [...sprintsData.sprints] : [];
    sprintsDataCopy.sort(sortSprintsByStartDate);
    return sprintsDataCopy;
  }, [sprintsData]);

  const backlogs = sprintsData?.unassignedBacklogs;

  const renderSprintListingCards = (sprint: Sprint) => (
    <List.Item className="sprint-card-container">
      <SprintListingCard sprint={sprint} setSprint={setSprintToEdit} setIsModalVisible={setIsModalVisible} />
    </List.Item>
  );

  const autoGeneratedNewSprint =
    sprints && sprints.length > 0 ? autoSuggestNewSprint(sprints[sprints.length - 1]) : GENERIC_NEW_SPRINT;

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination || destination.droppableId === source.droppableId) {
      return;
    }

    try {
      const payload = {
        projectId,
        backlogId: Number(draggableId),
        srcSprintId: Number(source.droppableId) || null,
        fieldToUpdate: {
          sprint_id: Number(destination.droppableId) || null,
        },
      };
      await updateBacklog(payload).unwrap();
      message.success({ content: 'Backlog moved', key: 'backlogUpdateMessage' });
    } catch (e) {
      message.error({ content: 'Failed to move backlog', key: 'backlogUpdateMessage' });
      console.error(e);
    }
  };

  return (
    <Container noGap fullWidth>
      <div className="project-sprint-container">
        <div className="project-sprint-title-container">
          <Title className="project-sprint-title" level={2}>
            Sprints
          </Title>
          <SprintCreationModal
            isModalVisible={isModalVisible}
            setIsModalVisible={setIsModalVisible}
            sprint={sprintToEdit}
            setSprint={setSprintToEdit}
            latestSprint={autoGeneratedNewSprint}
          />
          <BacklogCreationModal />
        </div>
        <DragDropContext onDragEnd={onDragEnd}>
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
      </div>
    </Container>
  );
}

export default ProjectSprints;