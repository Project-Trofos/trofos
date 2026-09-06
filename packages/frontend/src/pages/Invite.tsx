import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { message, Result } from 'antd';
import { useLazyGetInfoFromInviteQuery, useProcessProjectInvitationMutation } from '../api/invite';
import { getErrorMessage } from '../helpers/error';

export default function InvitePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [processInvite] = useProcessProjectInvitationMutation();
  const [getInfoFromToken] = useLazyGetInfoFromInviteQuery();
  const isFirstRender = useRef(true);
  const [projectName, setProjectName] = useState<string>();
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
    const inviteMetadata = await getInfoFromToken(token).unwrap();
    setProjectName(inviteMetadata.projectName);
    await handleInvite(token);
  }, [getInfoFromToken, handleInvite, searchParams]);

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

  return errorMessage ? (
    <Result status="error" title="Unable to join project" subTitle={errorMessage} />
  ) : (
    <Result
      status="info"
      title={projectName ? `Joining ${projectName}` : 'Processing invitation'}
      subTitle="Please wait while we validate your project invitation."
    />
  );
}
