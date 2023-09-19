import React from 'react';
import { Avatar } from 'antd';
import { UserInfo } from '../../api/auth';
import { UserAvatar } from '../avatar/UserAvatar';

import './AvatarButton.css';

export default function AvatarButton(props: { userInfo: UserInfo | undefined }) {
  const { userInfo } = props;

  if (!userInfo) {
    return <Avatar className="avatar-button"></Avatar>;
  } else {
    return (
      <UserAvatar
        className="avatar-button"
        userDisplayName={userInfo.userDisplayName}
        userHashString={userInfo.userEmail}
      />
    );
  }
}
