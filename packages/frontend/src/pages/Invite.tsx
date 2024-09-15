import React, { useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { message } from 'antd';
import { useGetInfoFromInviteMutation, useProcessProjectInvitationMutation } from '../api/invite';
import { getErrorMessage } from '../helpers/error';

export default function InvitePage() {
  const [searchParams, _] = useSearchParams();
  const navigate = useNavigate();
  const [processInvite] = useProcessProjectInvitationMutation();
  const [getInfoFromToken] = useGetInfoFromInviteMutation();
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
    if (searchParams.get('token') == null) {
      throw new Error('Invalid invite');
    }

    const token = searchParams.get('token')!;
    const user = await getInfoFromToken(token).unwrap();

    // Email is already registered
    if (user.exists) {
      await handleInvite(token);
      return;
    }

    navigate('/register', {
      state: {
        isFromInvite: true,
        email: user.email,
      },
    });
  }, [searchParams, handleInvite]);

  useEffect(() => {
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
