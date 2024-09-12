import React, { useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { message } from 'antd';
import { useProcessProjectInvitationMutation } from '../api/invite';
import { getErrorMessage } from '../helpers/error';

export default function InvitePage() {
  const [searchParams, _] = useSearchParams();
  const navigate = useNavigate();
  const [processInvite] = useProcessProjectInvitationMutation();
  const isFirstRender = useRef(true);

  const handleInvite = useCallback(
    async (token: string) => {
      try {
        await processInvite(token).unwrap();
        message.success('Invited');
      } catch (err) {
        throw err;
      } finally {
        navigate('/');
      }
    },
    [processInvite],
  );

  const processToken = useCallback(async () => {
    const isRegister = searchParams.get('register') == 'true';

    // Email is already registered
    if (!isRegister) {
      await handleInvite(searchParams.get('token')!);
      return;
    }

    // TODO: redirect to register page
  }, [searchParams, handleInvite]);

  useEffect(() => {
    if (searchParams.get('token') == null) {
      return;
    }

    // Process token once only
    if (isFirstRender.current) {
      isFirstRender.current = false;

      processToken().catch((err) => message.error(getErrorMessage(err)));
    }
  }, [searchParams, processToken]);

  return (
    <main style={{ padding: '1rem' }}>
      <p>processing invite...</p>
    </main>
  );
}
