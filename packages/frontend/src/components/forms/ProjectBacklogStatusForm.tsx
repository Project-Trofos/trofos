import React, { useEffect, useState } from 'react';
import { Button, Form, Input, message } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { DragDropContext, Draggable } from 'react-beautiful-dnd';
import StrictModeDroppable from '../dnd/StrictModeDroppable';
import { BacklogStatusData } from '../../api/types';
import {
  useCreateBacklogStatusMutation,
  useDeleteBacklogStatusMutation,
  useUpdateBacklogStatusMutation,
  useUpdateBacklogStatusOrderMutation,
} from '../../api/project';
import './ProjectBacklogStatusForm.css';
import { sortBacklogStatus } from '../../helpers/sortBacklogStatus';

type StatuesesPropType = Omit<BacklogStatusData, 'projectId'>[];

export default function ProjectBacklogStatusForm(props: { statuses: StatuesesPropType }) {
  const { statuses } = props;

  const [form] = Form.useForm();

  const params = useParams();
  const projectId = Number(params.projectId);

  const [createBacklogStatus] = useCreateBacklogStatusMutation();
  const [updateBacklogStatus] = useUpdateBacklogStatusMutation();
  const [updateBacklogStatusOrder] = useUpdateBacklogStatusOrderMutation();
  const [deleteBacklogStatus] = useDeleteBacklogStatusMutation();

  const [isAddingStatus, setIsAddingStatus] = useState(false);

  const handleBacklogStatusUpdate = async (e: React.FocusEvent<HTMLInputElement, Element>) => {
    if (!e?.target?.id || !e?.target?.value || e.target.id === e.target.value) {
      return;
    }

    const backlogStatusToUpdate = {
      projectId,
      currentName: e.target.id,
      updatedName: e.target.value,
    };

    try {
      await updateBacklogStatus(backlogStatusToUpdate).unwrap();
      message.success({ content: 'Backlog status updated', key: 'backlogStatusUpdateMessage' });
    } catch (err) {
      message.error({ content: 'Failed to update backlog status', key: 'backlogStatusUpdateMessage' });
      console.error(err);
    }
  };

  const reorder = (list: StatuesesPropType, startIndex: number, endIndex: number): StatuesesPropType => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result.map((status, index) => {
      // eslint-disable-next-line no-param-reassign
      status.order = index + 1;
      return status;
    });
  };

  const [statusOrder, setStatusOrder] = useState<StatuesesPropType>([]);
  const [inProgressOrder, setInProgressOrder] = useState<StatuesesPropType>([]);

  useEffect(() => {
    const sortedStatuses = sortBacklogStatus(statuses);
    setStatusOrder(sortedStatuses);
    setInProgressOrder(sortedStatuses.filter((status) => status.type === 'in_progress'));
  }, [statuses]);

  const onDragEnd = async (result: any) => {
    if (!result.destination) {
      return;
    }

    if (result.destination.index === result.source.index) {
      return;
    }

    const updatedStatusOrder: StatuesesPropType = reorder(
      inProgressOrder,
      result.source.index,
      result.destination.index,
    );

    const payload = {
      projectId,
      updatedStatuses: updatedStatusOrder,
    };

    try {
      await updateBacklogStatusOrder(payload).unwrap();
      setInProgressOrder(updatedStatusOrder);
      message.success({ content: 'Status order updated', key: 'backlogStatusOrderUpdateMessage' });
    } catch (err) {
      message.error({ content: 'Failed to update status order', key: 'backlogStatusOrderUpdateMessage' });
      console.error(err);
    }
  };

  const handleAddStatus = async (e: React.FocusEvent<HTMLInputElement, Element>) => {
    if (!e?.target?.value) {
      setIsAddingStatus(false);
      return;
    }

    const statusToCreate = {
      projectId,
      name: e.target.value,
    };

    try {
      await createBacklogStatus(statusToCreate).unwrap();
      setIsAddingStatus(false);
      message.success({ content: 'Backlog status added', key: 'addBacklogStatusMessage' });
    } catch (err) {
      message.error({ content: 'Failed to add backlog status', key: 'addBacklogStatusMessage' });
      console.error(err);
    }
  };

  const handleDeleteStatus = async (name: string) => {
    if (!name) {
      return;
    }

    const statusToDelete = {
      projectId,
      name,
    };

    try {
      await deleteBacklogStatus(statusToDelete).unwrap();
      message.success({ content: 'Backlog status deleted', key: 'deleteBacklogStatusMessage' });
    } catch (err) {
      message.error({
        content: 'Failed to delete backlog status. Please check if there are any backlogs assigned with this status.',
        key: 'deleteBacklogStatusMessage',
      });
      console.error(err);
    }
  };

  return (
    <>
      <Form form={form}>
        <Form.Item
          name={statusOrder?.[0]?.name}
          initialValue={statusOrder?.[0]?.name}
          key={statusOrder?.[0]?.name}
          rules={[{ required: true }]}
        >
          <Input onBlur={handleBacklogStatusUpdate} />
        </Form.Item>
        <DragDropContext onDragEnd={onDragEnd}>
          <StrictModeDroppable droppableId="backlogStatusList">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {inProgressOrder.map((status, index) => (
                  <Draggable key={status.name} draggableId={status.name} index={index}>
                    {(draggableProvided) => (
                      <div
                        className="project-backlog-status-draggable"
                        ref={draggableProvided.innerRef}
                        {...draggableProvided.draggableProps}
                        {...draggableProvided.dragHandleProps}
                      >
                        <Form.Item
                          name={status.name}
                          initialValue={status.name}
                          key={status.name}
                          rules={[{ required: true }]}
                        >
                          <Input onBlur={handleBacklogStatusUpdate} />
                        </Form.Item>
                        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
                        <div
                          className="project-backlog-status-delete-button"
                          onClick={() => handleDeleteStatus(status.name)}
                        >
                          <CloseOutlined />
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </StrictModeDroppable>
        </DragDropContext>
        {isAddingStatus && (
          <Form.Item rules={[{ required: true }]}>
            <Input onBlur={handleAddStatus} placeholder="Enter status name..." />
          </Form.Item>
        )}
        <Form.Item
          name={statusOrder?.[statusOrder.length - 1]?.name}
          initialValue={statusOrder?.[statusOrder.length - 1]?.name}
          key={statusOrder?.[statusOrder.length - 1]?.name}
          rules={[{ required: true }]}
        >
          <Input onBlur={handleBacklogStatusUpdate} />
        </Form.Item>
      </Form>
      <Button type="primary" onClick={() => setIsAddingStatus(true)}>
        Add
      </Button>
    </>
  );
}
