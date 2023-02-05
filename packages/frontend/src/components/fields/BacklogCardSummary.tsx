import React, { useEffect, useState } from 'react';
import { Input, message } from 'antd';
import { useParams } from 'react-router-dom';
import { useUpdateBacklogMutation } from '../../api/socket/backlogHooks';
import './BacklogCardSummary.css';

export default function BacklogCardSummary(props: { backlogId: number; currentSummary: string }) {
  const { backlogId, currentSummary } = props;

  const { TextArea } = Input;

  const params = useParams();
  const projectId = Number(params.projectId);
  const [updateBacklog] = useUpdateBacklogMutation();
  const [summaryValue, setSummaryValue] = useState(currentSummary);
  const [isError, setIsError] = useState(false);

  const handleSummaryValueChange = (event: React.ChangeEvent<HTMLTextAreaElement> | undefined) => {
    if (!event) return;
    setSummaryValue(event.target.value);
  };

  useEffect(() => {
    setSummaryValue(currentSummary);
  }, [currentSummary]);

  const handleSummaryChange = async (event: React.FocusEvent<HTMLTextAreaElement, Element>) => {
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
    <TextArea
      className="backlog-card-summary"
      value={summaryValue}
      onChange={handleSummaryValueChange}
      onBlur={handleSummaryChange}
      onClick={(e) => e.stopPropagation()}
      status={isError ? 'error' : undefined}
      autoSize={{ minRows: 1 }}
    />
  );
}
