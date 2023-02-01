import React, { useState } from 'react';
import { Button, Modal, Select, Space, message } from 'antd';

import { Role, UpdateUserRolePayload, User } from '../../api/types';
import { Subheading } from '../typography';
import { useUpdateUserRoleMutation } from '../../api/role';
import { getErrorMessage } from '../../helpers/error';

type UserManagement = {
  user: User;
  roles: Role[] | undefined;
};

export default function UserManagementModal(props: UserManagement): JSX.Element {
  const { user, roles } = props;
  const [updateUserRole] = useUpdateUserRoleMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleRoleChange = async (newRoleId: number) => {
    // No change to role id
    if (newRoleId === user.basicRoles[0].role_id) {
      return;
    }

    try {
      const payload: UpdateUserRolePayload = {
        userEmail: user.user_email,
        newRoleId,
      };
      await updateUserRole(payload).unwrap();
      message.success('User Role Updated!');
    } catch (err) {
      message.error(getErrorMessage(err));
    }
  };

  return (
    <>
      <Button onClick={showModal}>Manage</Button>
      <Modal title="User Management Panel" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
        <Space wrap>
          <Space direction="vertical">
            <Subheading>Role</Subheading>
            <Select
              defaultValue={user.basicRoles[0].role_id}
              style={{ width: 120 }}
              onChange={handleRoleChange}
              options={roles?.map((role) => {
                return { value: role.id, label: role.role_name };
              })}
            />
          </Space>
        </Space>
      </Modal>
    </>
  );
}
