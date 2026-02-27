import React, { useState } from 'react';
import { Modal, Button, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { User } from '../../api/types';
import { useDeleteUserMutation } from '../../api/user';

type UserDeletion = {
  user: User;
};

export default function UserDeletionModal({ user }: UserDeletion): JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteUser, { isLoading }] = useDeleteUserMutation();

  const showModal = () => setIsModalOpen(true);
  const handleCancel = () => setIsModalOpen(false);

  const handleDelete = async () => {
    try {
      await deleteUser(user.user_id).unwrap();
      message.success('User deleted successfully');
      setIsModalOpen(false);
    } catch (error) {
      message.error('Failed to delete user');
    }
  };

  return (
    <>
      <Button danger type="text" icon={<DeleteOutlined />} onClick={showModal} />
      <Modal
        title="Delete User"
        open={isModalOpen}
        onOk={handleDelete}
        onCancel={handleCancel}
        confirmLoading={isLoading}
        okText="Delete"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to delete the user <strong>{user.user_email}</strong>?</p>
        <p>This action cannot be undone.</p>
      </Modal>
    </>
  );
}