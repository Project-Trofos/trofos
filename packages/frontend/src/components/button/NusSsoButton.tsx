import React from 'react';
import { Button } from 'antd';
import Icon from '@ant-design/icons';

const nusIcon = <Icon component={() => <img src="nus-icon.ico" />} />;
const BASE_URL = 'https://vafs.nus.edu.sg/adfs/oauth2/authorize';
const RESPONSE_TYPE = 'code';
const CLIENT_ID = 'INC000002767827';
const STATE = 'NUS_OAUTH2';
const REDIRECT_URI = `${encodeURIComponent(window.location.origin.toString())}%2Fcallback%2Foauth2`;
const RESOURCE = 'sg_edu_nus_oauth';
const HREF_URL = `${BASE_URL}?
response_type=${RESPONSE_TYPE}&
client_id=${CLIENT_ID}&
state=${STATE}&
redirect_uri=${REDIRECT_URI}&
resource=${RESOURCE}`;

export default function NusSsoButton() {
  return (
    <Button icon={nusIcon} href={HREF_URL}>
      NUS
    </Button>
  );
}
