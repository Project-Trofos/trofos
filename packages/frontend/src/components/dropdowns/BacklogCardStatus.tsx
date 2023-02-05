import React from 'react';
import { message, Select } from 'antd';
import { useParams } from 'react-router-dom';
import { useGetBacklogStatusQuery } from '../../api/project';
import { BacklogStatusData } from '../../api/types';
import { useUpdateBacklogMutation } from '../../api/socket/backlogHooks';
import './BacklogCardStatus.css';

export default function BacklogCardStatus(props: { backlogId: number; currentStatus: string }) {
  const { currentStatus, backlogId } = props;
  const params = useParams();
  const projectId = Number(params.projectId);
  const { data: backlogStatus } = useGetBacklogStatusQuery({ id: projectId });
  const [updateBacklog] = useUpdateBacklogMutation();

  const processBacklogStatusOptions = (statuses: BacklogStatusData[] | undefined) => {
    return statuses?.map((status: BacklogStatusData) => {
      return { value: status.name };
    });
  };

  const handleStatusChange = async (updatedStatus: string) => {
    const payload = {
      backlogId,
      projectId,
      fieldToUpdate: {
        status: updatedStatus,
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
      className="backlog-card-status"
      value={currentStatus}
      options={processBacklogStatusOptions(backlogStatus)}
      onClick={(e) => e.stopPropagation()}
      onChange={handleStatusChange}
      dropdownMatchSelectWidth={false}
      showArrow={false}
    />
  );
}
