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
    const results = await Promise.allSettled(userIds.map((userId) => deleteUser(userId).unwrap()));
    const failures = results.filter((result) => result.status === 'rejected');
    const succeededCount = results.length - failures.length;

    if (succeededCount > 0) {
      message.success(`${succeededCount} user${succeededCount !== 1 ? 's' : ''} deleted successfully`);
    }
    if (failures.length > 0) {
      const firstFailure = failures[0] as PromiseRejectedResult;
      message.error(
        `Failed to delete ${failures.length} user${failures.length !== 1 ? 's' : ''}: ${getErrorMessage(firstFailure.reason)}`,
      );
    }

    setIsModalOpen(false);
    // Always clear the selection: users who were actually deleted are already gone
    // from the refetched table, and keeping the rest selected risks a retry
    // re-targeting ids that may no longer be valid.
    onDeleted();
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
