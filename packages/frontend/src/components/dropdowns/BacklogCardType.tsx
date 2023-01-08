import React from 'react';
import { message, Select } from 'antd';
import { useParams } from 'react-router-dom';
import { useUpdateBacklogMutation } from '../../api/backlog';
import './BacklogCardType.css';

type BacklogType = 'story' | 'task' | 'bug';

const BACKLOG_TYPE_OPTIONS = [
  { value: 'story', label: 'Story' },
  { value: 'task', label: 'Task' },
  { value: 'bug', label: 'Bug' },
];

export default function BacklogCardType(props: { backlogId: number; currentType: BacklogType }) {
  const { currentType, backlogId } = props;
  const params = useParams();
  const projectId = Number(params.projectId);
  const [updateBacklog] = useUpdateBacklogMutation();

  const handleTypeChange = async (updatedType: BacklogType) => {
    const payload = {
      backlogId,
      projectId,
      fieldToUpdate: {
        type: updatedType,
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
      className="backlog-card-type"
      defaultValue={currentType}
      options={BACKLOG_TYPE_OPTIONS}
      onClick={(e) => e.stopPropagation()}
      onChange={handleTypeChange}
      dropdownMatchSelectWidth={false}
      showArrow={false}
    />
  );
}
