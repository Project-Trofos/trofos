import React, { useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { message } from 'antd';
import { useProcessProjectInvitationMutation, useGetProjectInvitationQuery } from '../api/invite';
import { getErrorMessage } from '../helpers/error';

export default function InvitePage() {
  const [searchParams, _] = useSearchParams();
  const navigate = useNavigate();
  const { data: verifiedToken } = useGetProjectInvitationQuery(
    searchParams.get('token') != null ? searchParams.get('token')! : '',
  );
  const [processInvite] = useProcessProjectInvitationMutation();

  useEffect(() => {
    if (verifiedToken == null) {
      return;
    }

    try {
      const isRegister = searchParams.get('register') == 'true';

      // Email is already registered
      if (!isRegister) {
        handleInvite(verifiedToken.token);
        return;
      }
    } catch (err) {
      message.error(getErrorMessage(err));
    }
  }, [verifiedToken]);

  const handleInvite = useCallback(
    async (token: string) => {
      try {
        await processInvite(token).unwrap();
        navigate('/');
        message.success('Invited');
      } catch (err) {
        throw err;
      }
    },
    [processInvite],
  );

  return (
    <main style={{ padding: '1rem' }}>
      <p>processing invite...</p>
    </main>
  );
}
