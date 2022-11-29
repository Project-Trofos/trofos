import React, { useState } from 'react';
import { Button, Modal } from 'antd';

export default function UserManagementModal(): JSX.Element {
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

  return (
    <>
      <Button onClick={showModal}>Manage</Button>
      <Modal title="User Management Panel" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
        <h1>Does nothing for now</h1>
      </Modal>
    </>
  );
}
