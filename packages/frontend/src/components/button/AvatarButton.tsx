import React from 'react';
import { Avatar } from 'antd';
import { UserInfo } from '../../api/auth';

import './AvatarButton.css';

export default function AvatarButton(props: { userInfo: UserInfo | undefined }) {
  const { userInfo } = props;

  const name = userInfo?.userEmail[0];

  return <Avatar className="avatar-button">{name}</Avatar>;
}
