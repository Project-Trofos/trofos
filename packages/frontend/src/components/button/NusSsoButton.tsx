import React, { useCallback } from 'react';
import { Button, message } from 'antd';
import { redirect } from 'react-router-dom';
import Icon from '@ant-design/icons';
import { useGenerateSAMLRequestMutation } from '../../api/auth';

const nusIcon = <Icon component={() => <img src="nus-icon.ico" />} />;

export default function NusSsoButton() {
  const [generateSAMLRequest] = useGenerateSAMLRequestMutation();

  const ssoLogin = useCallback(async () => {
    try {
      const { redirectUrl } = await generateSAMLRequest().unwrap();

      if (!redirectUrl) {
        throw Error('Failed to get redirect URL');
      }

      window.location.href = redirectUrl;
    } catch (err) {
      console.error(err);
    }
    message.error('Something went wrong while signing in.');
  }, [generateSAMLRequest]);

  return (
    <Button icon={nusIcon} onClick={ssoLogin}>
      NUS
    </Button>
  );
}
