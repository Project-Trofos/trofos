import React from 'react';
import { message, Select } from 'antd';
import { useParams } from 'react-router-dom';
import { useUpdateBacklogMutation } from '../../api/socket/backlogHooks';
import { BACKLOG_PRIORITY_OPTIONS } from '../../helpers/constants';
import { BacklogPriority } from '../../api/types';
import './BacklogCardPriority.css';

type BacklogCardPriorityProps = {
  backlogId: number;
  currentPriority: BacklogPriority;
  projectId?: number;
  editable?: boolean;
};

export default function BacklogCardPriority(props: BacklogCardPriorityProps) {
  const { currentPriority, backlogId, projectId, editable = true } = props;
  const params = useParams();
  const [updateBacklog] = useUpdateBacklogMutation();

  const handlePriorityChange = async (updatedPriority: BacklogPriority | undefined) => {
    const payload = {
      backlogId,
      projectId: projectId ?? Number(params.projectId),
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
      value={currentPriority}
      options={BACKLOG_PRIORITY_OPTIONS}
      onClick={(e) => e.stopPropagation()}
      onChange={handlePriorityChange}
      dropdownMatchSelectWidth={false}
      allowClear
      suffixIcon={false}
      disabled={!editable}
    />
  );
}
