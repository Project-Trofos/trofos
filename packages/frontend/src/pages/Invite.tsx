import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, message, Modal, Result, Space, Typography } from 'antd';
import { useLazyGetInfoFromInviteQuery, useProcessProjectInvitationMutation } from '../api/invite';
import { InviteMetadata } from '../api/types';
import { getErrorMessage } from '../helpers/error';

export default function InvitePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [processInvite, { isLoading: isJoining }] = useProcessProjectInvitationMutation();
  const [getInfoFromToken] = useLazyGetInfoFromInviteQuery();
  const isFirstRender = useRef(true);
  const [inviteMetadata, setInviteMetadata] = useState<InviteMetadata>();
  const [errorMessage, setErrorMessage] = useState<string>();

  const handleInvite = useCallback(
    async (token: string) => {
      try {
        const result = await processInvite(token).unwrap();
        message.success('You have joined the project');
        navigate(`/project/${result.projectId}`);
      } catch (error) {
        const apiError = error as { status?: number };
        if (apiError.status === 401) {
          const returnPath = `/join?token=${encodeURIComponent(token)}`;
          navigate(`/login?redirect=${encodeURIComponent(returnPath)}`);
          message.info('Sign in to accept this invitation.');
          return;
        }

        throw error;
      }
    },
    [navigate, processInvite],
  );

  const processToken = useCallback(async () => {
    if (searchParams.get('token') == null) {
      throw new Error('Invalid invite');
    }

    const token = searchParams.get('token')!;
    const metadata = await getInfoFromToken(token).unwrap();
    setInviteMetadata(metadata);
  }, [getInfoFromToken, searchParams]);

  useEffect(() => {
    // Process token once only
    if (isFirstRender.current) {
      isFirstRender.current = false;

      processToken().catch((err) => {
        const error = getErrorMessage(err);
        setErrorMessage(error);
        message.error(error);
      });
    }
  }, [searchParams, processToken]);

  if (errorMessage) {
    return <Result status="error" title="Unable to join project" subTitle={errorMessage} />;
  }

  return (
    <>
      <Result
        status="info"
        title={inviteMetadata ? `Invitation to ${inviteMetadata.projectName}` : 'Loading invitation'}
        subTitle="Review the invitation before joining the project."
      />
      <Modal
        title="Project invitation"
        open={inviteMetadata !== undefined}
        onCancel={() => navigate('/projects')}
        footer={[
          <Button key="cancel" onClick={() => navigate('/projects')}>
            Cancel
          </Button>,
          <Button
            key="join"
            type="primary"
            loading={isJoining}
            onClick={() => handleInvite(searchParams.get('token')!)}
          >
            Join project
          </Button>,
        ]}
      >
        {inviteMetadata && (
          <Space direction="vertical" size="small">
            <Typography.Paragraph>
              <strong>{inviteMetadata.inviterName}</strong> is inviting you to join the following project:
            </Typography.Paragraph>
            <Typography.Text>
              <strong>Name:</strong> {inviteMetadata.projectName}
            </Typography.Text>
            {inviteMetadata.courseName && (
              <Typography.Text>
                <strong>Course:</strong> {inviteMetadata.courseName}
              </Typography.Text>
            )}
          </Space>
        )}
      </Modal>
    </>
  );
}
