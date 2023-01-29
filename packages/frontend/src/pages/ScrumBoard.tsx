import React from 'react';
import { Alert, message, Typography } from 'antd';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { useParams } from 'react-router-dom';
import { useUpdateBacklogMutation } from '../api/backlog';
import { useGetBacklogStatusQuery, useGetProjectQuery } from '../api/project';
import { useGetActiveSprintQuery } from '../api/sprint';
import type { Backlog, ScrumBoardUserData } from '../api/types';
import ScrumBoardCard from '../components/cards/ScrumBoardCard';
import StrictModeDroppable from '../components/dnd/StrictModeDroppable';
import './ScrumBoard.css';
import useSocket, { UpdateType } from '../api/socket/useSocket';

const { Title } = Typography;

export default function ScrumBoard(): JSX.Element {
  const params = useParams();
  const projectId = Number(params.projectId);
  const { data: activeSprint, refetch: refetchActiveSprint } = useGetActiveSprintQuery(projectId);
  const { data: backlogStatus } = useGetBacklogStatusQuery({ id: projectId });
  const { data: projectData } = useGetProjectQuery({ id: projectId });

  // Refetch active sprint data upon update
  useSocket(UpdateType.BACKLOG, projectData ? projectData.id.toString() : undefined, refetchActiveSprint);

  const [updateBacklog] = useUpdateBacklogMutation();

  const processBacklogs = (backlogs?: Backlog[]) => {
    if (!backlogs) {
      return undefined;
    }

    return [...backlogs].sort((b1, b2) => b1.backlog_id - b2.backlog_id);
  };

  // Add a placeholder user for the unassigned backlogs
  const addUnassignedUser = (users: ScrumBoardUserData[] | undefined) => {
    if (!users) {
      return [];
    }

    const updatedUsers = [...users];
    const unassignedUser = { user: { user_id: null, user_email: 'Unassigned' } };
    updatedUsers.push(unassignedUser);
    return updatedUsers;
  };

  const backlogs = processBacklogs(activeSprint?.backlogs);
  const users = addUnassignedUser(projectData?.users);

  // Generate an object to keep track of the droppableId to the respective user and status
  const generateDroppableMapping = () => {
    if (!projectData || !backlogStatus) {
      return {};
    }

    const mapping: { [key: number | string]: { user: number | null; status: string } } = {};
    let key = 0;

    for (const user of users) {
      for (const status of backlogStatus) {
        mapping[key] = {
          user: user.user.user_id,
          status: status.name,
        };
        key += 1;
      }
    }

    return mapping;
  };

  const droppableIdMapping = generateDroppableMapping();

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination || destination.droppableId === source.droppableId) {
      return;
    }

    try {
      const payload = {
        projectId,
        backlogId: Number(draggableId),
        fieldToUpdate: {
          assignee_id: droppableIdMapping[destination.droppableId].user,
          status: droppableIdMapping[destination.droppableId].status,
        },
      };
      await updateBacklog(payload).unwrap();
      message.success({ content: 'Backlog updated', key: 'backlogUpdateMessage' });
    } catch (e) {
      message.error({ content: 'Failed to update backlog', key: 'backlogUpdateMessage' });
      console.error(e);
    }
  };

  const renderDroppables = () => {
    if (!projectData || !backlogStatus) {
      return [];
    }

    const droppables = [];
    const key = { count: 0 };

    const renderUserDroppables = (userId: number | null) => {
      const userDroppables = [];
      for (const status of backlogStatus) {
        userDroppables.push(
          <StrictModeDroppable key={key.count} droppableId={key.count.toString()}>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {backlogs
                  ?.filter((backlog) => backlog.status === status.name && backlog.assignee_id === userId)
                  ?.map((backlog, index) => (
                    <ScrumBoardCard
                      key={backlog.backlog_id}
                      backlog={backlog}
                      projectKey={projectData?.pkey}
                      index={index}
                    />
                  ))}
                {provided.placeholder}
              </div>
            )}
          </StrictModeDroppable>,
        );

        key.count += 1;
      }

      return userDroppables;
    };

    for (const user of users) {
      droppables.push(
        <div key={user.user.user_id} className="scrum-board-user-container">
          <Title className="scrum-board-user-title" level={5}>
            {user.user.user_email}
          </Title>
          <div className="scrum-board-droppable">{renderUserDroppables(user.user.user_id)}</div>
        </div>,
      );
    }

    return droppables;
  };

  return (
    <div className="scrum-board-drag-drop-context">
      {!backlogs && (
        <Alert
          className="scrum-board-warning"
          message="No Active Sprint"
          description="You have not started a sprint. To display backlogs on the scrum board, you will need to start a sprint first."
          type="warning"
        />
      )}
      <div className="scrum-board-status-container">
        {backlogStatus?.map((status) => (
          <div key={status.name} className="scrum-board-status">
            <Title level={5}>{status.name} </Title>
          </div>
        ))}
      </div>
      <DragDropContext onDragEnd={onDragEnd}>{renderDroppables()}</DragDropContext>
    </div>
  );
}
