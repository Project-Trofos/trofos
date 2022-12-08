import React, { useState } from 'react';
import { Input, message } from 'antd';
import { useParams } from 'react-router-dom';
import { useUpdateBacklogMutation } from '../../api/backlog';
import './BacklogCardSummary.css';

export default function BacklogCardSummary(props: { backlogId: number; currentSummary: string }) {
  const { backlogId, currentSummary } = props;

  const params = useParams();
  const projectId = Number(params.projectId);
  const [updateBacklog] = useUpdateBacklogMutation();
  const [isError, setIsError] = useState(false);

  const handleSummaryChange = async (event: React.FocusEvent<HTMLInputElement, Element>) => {
    const updatedSummary = event.target.value;
    if (!updatedSummary) {
      setIsError(true);
      message.error({ content: 'Summary cannot be empty', key: 'backlogUpdateMessage' });
      return;
    }

    if (updatedSummary === currentSummary) {
      setIsError(false);
      return;
    }

    const payload = {
      backlogId,
      projectId,
      fieldToUpdate: {
        summary: updatedSummary,
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
    <Input
      className="backlog-card-summary"
      defaultValue={currentSummary}
      onBlur={handleSummaryChange}
      onClick={(e) => e.stopPropagation()}
      status={isError ? 'error' : undefined}
    />
  );
}
