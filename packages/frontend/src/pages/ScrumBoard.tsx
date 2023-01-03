import { message } from 'antd';
import React from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { useParams } from 'react-router-dom';
import { Backlog, useUpdateBacklogMutation } from '../api/backlog';
import { useGetBacklogStatusQuery, useGetProjectQuery } from '../api/project';
import { useGetActiveSprintQuery } from '../api/sprint';
import ScrumBoardCard from '../components/cards/ScrumBoardCard';
import StrictModeDroppable from '../components/dnd/StrictModeDroppable';
import './ScrumBoard.css';

export default function ScrumBoard(): JSX.Element {
  const params = useParams();
  const projectId = Number(params.projectId);
  const { data: activeSprint } = useGetActiveSprintQuery(projectId);
  const { data: backlogStatus } = useGetBacklogStatusQuery({ id: projectId });
  const { data: projectData } = useGetProjectQuery({ id: projectId });

  const [updateBacklog] = useUpdateBacklogMutation();

  const processBacklogs = (backlogs?: Backlog[]) => {
    if (!backlogs) {
      return undefined;
    }

    return [...backlogs].sort((b1, b2) => b1.backlog_id - b2.backlog_id);
  };

  const backlogs = processBacklogs(activeSprint?.backlogs);

  const onDragEnd = async (result: DropResult) => {
    console.log(result);
    const { destination, source, draggableId } = result;

    if (!destination || destination.droppableId === source.droppableId) {
      return;
    }

    try {
      const payload = {
        projectId,
        backlogId: Number(draggableId),
        fieldToUpdate: {
          status: destination.droppableId,
        },
      };
      await updateBacklog(payload).unwrap();
      message.success({ content: 'Backlog updated', key: 'backlogUpdateMessage' });
    } catch (e) {
      message.error({ content: 'Failed to update backlog', key: 'backlogUpdateMessage' });
      console.error(e);
    }
  };

  return (
    <div className="scrum-board-droppable-context">
      <DragDropContext onDragEnd={onDragEnd}>
        {backlogStatus?.map((status) => (
          <StrictModeDroppable key={status.name} droppableId={status.name}>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {backlogs
                  ?.filter((backlog) => backlog.status === status.name)
                  .map((backlog, index) => (
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
          </StrictModeDroppable>
        ))}
      </DragDropContext>
    </div>
  );
}
