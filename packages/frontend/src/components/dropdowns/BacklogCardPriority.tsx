import React from 'react';
import { message, Select } from 'antd';
import { useParams } from 'react-router-dom';
import { useUpdateBacklogMutation } from '../../api/backlog';
import './BacklogCardPriority.css';

type BacklogPriority = 'very_high' | 'high' | 'medium' | 'low' | 'very_low' | null;

const BACKLOG_PRIORITY_OPTIONS = [
  { value: 'very_high', label: 'Very High' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
  { value: 'very_low', label: 'Very Low' },
];

export default function BacklogCardPriority(props: { backlogId: number; currentPriority: BacklogPriority }) {
  const { currentPriority, backlogId } = props;
  const params = useParams();
  const projectId = Number(params.projectId);
  const [updateBacklog] = useUpdateBacklogMutation();

  const handlePriorityChange = async (updatedPriority: BacklogPriority | undefined) => {
    const payload = {
      backlogId,
      projectId,
      fieldToUpdate: {
        priority: updatedPriority || null,
      },
    };

    try {
      await updateBacklog(payload).unwrap();
      message.success({ content: 'Backlog updated', key: 'backlogUpdateMessage' });
    } catch (e) {
      message.error({ content: 'Failed to update backlog', key: 'backlogUpdateMessage' });
      console.error(e);
    }
  };

  return (
    <Select
      className={`backlog-card-priority ${currentPriority}-priority`}
      defaultValue={currentPriority}
      options={BACKLOG_PRIORITY_OPTIONS}
      onClick={(e) => e.stopPropagation()}
      onChange={handlePriorityChange}
      dropdownMatchSelectWidth={false}
      allowClear
      showArrow={false}
    />
  );
}
