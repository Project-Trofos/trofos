import React, { useState } from 'react';
import { Button, Modal, Select, message } from 'antd';
import { ActionsOnRoles } from '../../api/types';

type UserRoleManagement = {
  userRoleId: number | undefined;
  userRoleName: string | undefined;
  userEmail: string | undefined;
  userId: number | undefined;
  roles: ActionsOnRoles[] | undefined;
  handleRoleChange: (roleId: number, userId: number) => void;
  isProjectOwner: boolean;
};

export default function UserTableRoleManagementModal(props: UserRoleManagement): JSX.Element {
  const { userRoleId, userRoleName, userEmail, userId, roles, handleRoleChange, isProjectOwner } = props;

  const [currentRole, setCurrentRole] = useState(userRoleId);

  const { Option } = Select;

  const handleSelectionChange = (value: string) => {
    setCurrentRole(Number(value));
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    if (isProjectOwner) {
      message.error('Owner must be FACULTY role');
      return;
    }
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    if (!userEmail || !currentRole || !userId) {
      return;
    }

    await handleRoleChange(currentRole, userId);

    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button size="small" onClick={showModal}>
        {userRoleName}
      </Button>
      <Modal title="Modify User's Role" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
        <Select defaultValue={userRoleName} onChange={handleSelectionChange}>
          {roles?.map((role) => (
            <Option key={role.id} value={role.id}>
              <span>{role.role_name}</span>
            </Option>
          ))}
        </Select>
      </Modal>
    </>
  );
}
