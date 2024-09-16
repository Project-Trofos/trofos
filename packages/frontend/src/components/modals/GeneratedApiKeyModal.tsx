import React from 'react';
import { Button, Modal, Typography } from 'antd';

const { Text } = Typography;

type GeneratedApiKeyModalProps = {
  isModalOpen: boolean;
  apiKey: string | null;
  handleClose: () => void;
};

export default function GeneratedApiKeyModal({
  isModalOpen,
  apiKey,
  handleClose,
}: GeneratedApiKeyModalProps): JSX.Element {

  return (
    <>
      <Modal
        title="Generated API Key"
        open={isModalOpen}
        onCancel={handleClose}
        footer={[
          <Button key="back" onClick={handleClose}>
            Close
          </Button>,
        ]}
      >
        <Text
          code
          copyable
        >
          {apiKey}
        </Text>
        <p>You cannot access this API key after closing this window! Save this somewhere</p>
      </Modal>
    </>
  );
}
