import { LinkOutlined } from '@ant-design/icons';
import { Button, Input, message, Modal, Space, Spin, Typography } from 'antd';
import React, { useMemo, useState } from 'react';
import { useCreateOrGetProjectInviteLinkMutation } from '../../api/invite';
import { Invite } from '../../api/types';
import { formatDbTimestamp } from '../../helpers/dateFormatter';
import { getErrorMessage } from '../../helpers/error';

type ProjectInviteLinkModalProps = {
  projectId: number;
};

export default function ProjectInviteLinkModal({ projectId }: ProjectInviteLinkModalProps): JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [invite, setInvite] = useState<Invite | null>(null);
  const [createOrGetInviteLink, { isLoading }] = useCreateOrGetProjectInviteLinkMutation();

  const inviteLink = useMemo(
    () => (invite ? `${window.location.origin}/join?token=${invite.unique_token}` : ''),
    [invite],
  );

  const showModal = async () => {
    setIsModalOpen(true);
    setInvite(null);

    try {
      const result = await createOrGetInviteLink({ projectId }).unwrap();
      setInvite(result);
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      message.success('Invite link copied');
    } catch {
      message.error('Unable to copy invite link');
    }
  };

  return (
    <>
      <Button icon={<LinkOutlined />} onClick={showModal}>
        Invite
      </Button>
      <Modal
        title="Project invite link"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsModalOpen(false)}>
            Close
          </Button>,
        ]}
      >
        <Spin spinning={isLoading}>
          <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
            <Typography.Text>
              Send this link to anyone you want to invite to your project. They will be able to join your project by
              clicking the link and signing up or logging in.
            </Typography.Text>
            {invite && (
              <>
                <Space.Compact style={{ width: '100%' }}>
                  <Input aria-label="Project invite link" readOnly value={inviteLink} />
                  <Button onClick={copyInviteLink}>Copy</Button>
                </Space.Compact>
                <Typography.Text type="secondary">Expires {formatDbTimestamp(invite.expiry_date)}</Typography.Text>
              </>
            )}
          </Space>
        </Spin>
      </Modal>
    </>
  );
}
