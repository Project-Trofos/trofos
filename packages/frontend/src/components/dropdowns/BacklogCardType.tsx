import React from 'react';
import { message, Select } from 'antd';
import { useParams } from 'react-router-dom';
import { useUpdateBacklogMutation } from '../../api/socket/backlogHooks';
import './BacklogCardType.css';
import { BACKLOG_TYPE_OPTIONS } from '../../helpers/constants';

type BacklogType = 'story' | 'task' | 'bug';

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
      value={currentType}
      options={BACKLOG_TYPE_OPTIONS}
      onClick={(e) => e.stopPropagation()}
      onChange={handleTypeChange}
      dropdownMatchSelectWidth={false}
      suffixIcon={false}
    />
  );
}
