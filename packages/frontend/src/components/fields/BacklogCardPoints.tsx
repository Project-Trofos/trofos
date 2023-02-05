import React, { useState } from 'react';
import { InputNumber, message } from 'antd';
import { useParams } from 'react-router-dom';
import { useUpdateBacklogMutation } from '../../api/socket/backlogHooks';
import './BacklogCardPoints.css';

export default function BacklogCardPoints(props: { backlogId: number; currentPoints: number | null }) {
  const { backlogId, currentPoints } = props;

  const params = useParams();
  const projectId = Number(params.projectId);
  const [updateBacklog] = useUpdateBacklogMutation();
  const [isError, setIsError] = useState(false);

  const handlePointsChange = async (event: React.FocusEvent<HTMLInputElement, Element>) => {
    const updatedPoints = Number(event.target.value);
    if (!Number.isInteger(updatedPoints)) {
      setIsError(true);
      message.error({ content: 'Points must be an integer', key: 'backlogUpdateMessage' });
      return;
    }

    if (updatedPoints === currentPoints || (currentPoints === null && updatedPoints === 0)) {
      setIsError(false);
      return;
    }

    const payload = {
      backlogId,
      projectId,
      fieldToUpdate: {
        points: updatedPoints || null,
      },
    };

    try {
      await updateBacklog(payload).unwrap();
      setIsError(false);
      message.success({ content: 'Backlog updated', key: 'backlogUpdateMessage' });
    } catch (e) {
      message.error({ content: 'Failed to update backlog', key: 'backlogUpdateMessage' });
      console.error(e);
    }
  };

  return (
    <InputNumber
      className={`backlog-card-points ${currentPoints ? 'points-active' : ''}`}
      value={currentPoints || undefined}
      onClick={(e) => e.stopPropagation()}
      onBlur={handlePointsChange}
      min={1}
      controls={false}
      status={isError ? 'error' : undefined}
    />
  );
}
