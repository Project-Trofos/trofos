import React, { useState } from 'react';
import { Button, Divider, Input, Modal, Select, Space, message } from 'antd';

import { Role, UpdateUserRolePayload, User } from '../../api/types';
import { Subheading } from '../typography';
import { useUpdateUserRoleMutation } from '../../api/role';
import { getErrorMessage } from '../../helpers/error';
import { useGetUserInfoQuery } from '../../api/auth';
import { useRemoveUserMutation } from '../../api/user';

type UserManagement = {
  user: User;
  roles: Role[] | undefined;
};

type ButtonProp = {
  handleOk: () => void | undefined;
  handleCancel: () => void | undefined;
};

function OkButton(props: ButtonProp): JSX.Element {
  const { handleOk } = props;
  return (
    <Button key="ok" onClick={handleOk}>
      OK
    </Button>
  );
}

function CancelButton(props: ButtonProp): JSX.Element {
  const { handleCancel } = props;
  return (
    <Button key="cancel" onClick={handleCancel}>
      CANCEL
    </Button>
  );
}

export default function UserManagementModal(props: UserManagement): JSX.Element {
  const { user, roles } = props;
  const [updateUserRole] = useUpdateUserRoleMutation();
  const [removeUser] = useRemoveUserMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');

  const { data: userInfo, isLoading } = useGetUserInfoQuery();

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
        userId: user.user_id,
        newRoleId,
      };
      await updateUserRole(payload).unwrap();
      message.success('User Role Updated!');
    } catch (err) {
      message.error(getErrorMessage(err));
    }
  };

  const handleDeleteUser = async () => {
    // Cannot delete yourself if logged in user id equals this user
    if (user.user_id === userInfo?.userId) {
      return;
    }

    try {
      await removeUser({ user_id: user.user_id }).unwrap();
      message.success('User Deleted!');
    } catch (err) {
      message.error(getErrorMessage(err));
    }
  };

  const handleDeleteInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('changed');
    setDeleteInput(e.target.value);
  };

  const isButtonDisabled = (deleteInput: string) => {
    return deleteInput !== 'CONFIRM';
  };

  return (
    <>
      <Button onClick={showModal}>Manage</Button>
      <Modal
        title="User Management Panel"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Space style={{ justifyContent: 'space-between', display: 'flex' }}>
            <Button
              danger
              style={{ float: 'left' }}
              disabled={isButtonDisabled(deleteInput)}
              key="delete"
              onClick={handleDeleteUser}
            >
              DELETE USER
            </Button>
            <Space>
              <Button key="ok" style={{ float: 'right' }} type="primary" onClick={handleOk}>
                OK
              </Button>
              <Button key="cancel" style={{ float: 'right' }} onClick={handleCancel}>
                CANCEL
              </Button>
            </Space>
          </Space>,
        ]}
      >
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
            <Divider dashed={true} style={{ color: 'red' }}>
              DANGER ZONE: FOR USER DELETION ONLY
            </Divider>
            <Input placeholder='Type "CONFIRM" to continue' value={deleteInput} onChange={handleDeleteInputChange} />
          </Space>
        </Space>
      </Modal>
    </>
  );
}
