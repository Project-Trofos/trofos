import React from 'react';
import { message, Select } from 'antd';
import { useParams } from 'react-router-dom';
import { useUpdateBacklogMutation } from '../../api/socket/backlogHooks';
import { UserAvatar } from '../avatar/UserAvatar';
import { UserData } from '../../api/types';
import './BacklogCardAssignee.css';

export default function BacklogCardAssignee(props: {
  backlogId: number;
  currentAssignee: number | null;
  projectUsers: UserData[] | undefined;
}) {
  const { Option } = Select;
  const { currentAssignee, backlogId, projectUsers } = props;
  const params = useParams();
  const projectId = Number(params.projectId);
  const [updateBacklog] = useUpdateBacklogMutation();

  const handleAssigneeChange = async (updatedAssignee: number | undefined) => {
    const payload = {
      backlogId,
      projectId,
      fieldToUpdate: {
        assignee_id: updatedAssignee || null,
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
      className="backlog-card-assignee"
      value={currentAssignee}
      onClick={(e) => e.stopPropagation()}
      onChange={handleAssigneeChange}
      dropdownMatchSelectWidth={false}
      allowClear
      suffixIcon={false}
    >
      {projectUsers?.map((user) => (
        <Option key={user.user.user_id} value={user.user.user_id}>
          <UserAvatar
            className="assignee-avatar"
            userDisplayName={user.user.user_display_name}
            userHashString={user.user.user_email}
          />
          <span className="assignee-display-name">{user.user.user_display_name}</span>
        </Option>
      ))}
    </Select>
  );
}
