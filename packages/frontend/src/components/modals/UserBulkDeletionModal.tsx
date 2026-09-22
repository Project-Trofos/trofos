import React, { useState } from 'react';
import { Modal, Button, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useDeleteUserMutation } from '../../api/user';
import { getErrorMessage } from '../../helpers/error';

type UserBulkDeletion = {
  userIds: number[];
  onDeleted: () => void;
};

export default function UserBulkDeletionModal({ userIds, onDeleted }: UserBulkDeletion): JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteUser, { isLoading }] = useDeleteUserMutation();

  const showModal = () => setIsModalOpen(true);
  const handleCancel = () => setIsModalOpen(false);

  const handleDelete = async () => {
    try {
      await Promise.all(userIds.map((userId) => deleteUser(userId).unwrap()));
      message.success(`${userIds.length} user${userIds.length !== 1 ? 's' : ''} deleted successfully`);
      setIsModalOpen(false);
      onDeleted();
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  return (
    <>
      <Button danger icon={<DeleteOutlined />} disabled={userIds.length === 0} onClick={showModal}>
        Delete Selected
      </Button>
      <Modal
        title='Delete Selected Users'
        open={isModalOpen}
        onOk={handleDelete}
        onCancel={handleCancel}
        confirmLoading={isLoading}
        okText='Delete'
        okButtonProps={{ danger: true }}
      >
        <p>
          Are you sure you want to delete <strong>{userIds.length}</strong> selected user
          {userIds.length !== 1 ? 's' : ''}?
        </p>
        <p>This action cannot be undone.</p>
      </Modal>
    </>
  );
}
