/* eslint-disable react/jsx-props-no-spreading */
import { Button, Modal } from 'antd';
import React, { useState } from 'react';

/**
 * A simple modal that can show a button which activates a modal.
 * The modal can contain one element.
 */
export default function SimpleModal({
  children,
  title,
  buttonName,
  modalProps,
  buttonProps,
}: {
  children: React.ReactNode;
  title?: string;
  buttonName: string;
  modalProps?: React.ComponentProps<typeof Modal>;
  buttonProps?: React.ComponentProps<typeof Button>;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)} size="small" {...buttonProps}>
        {buttonName}
      </Button>
      <Modal
        title={title}
        open={isModalOpen}
        onOk={() => setIsModalOpen(false)}
        onCancel={() => setIsModalOpen(false)}
        {...modalProps}
      >
        {children}
      </Modal>
    </>
  );
}
