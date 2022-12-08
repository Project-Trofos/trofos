import React from 'react';
import { Avatar, message, Select } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { useUpdateBacklogMutation } from '../../api/backlog';
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

  // const processUserOptions = (users: UserData[] | undefined) => {
  //   if (!users) {
  //     return [];
  //   }

  //   // eslint-disable-next-line arrow-body-style
  //   return users.map((user) => {
  //     return { value: user.user.user_id, label: user.user.user_email };
  //   });
  // };

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
      defaultValue={currentAssignee}
      onClick={(e) => e.stopPropagation()}
      onChange={handleAssigneeChange}
      dropdownMatchSelectWidth={false}
      allowClear
      showArrow={false}
    >
      {projectUsers?.map((user) => (
        <Option key={user.user.user_id} value={user.user.user_id}>
          <Avatar className="assignee-avatar" style={{ backgroundColor: '#85041C' }} icon={<UserOutlined />} />
          <span className="assignee-email">{user.user.user_email}</span>
        </Option>
      ))}
    </Select>
  );
}
