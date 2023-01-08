import React from 'react';
import { Avatar as AntdAvatar } from 'antd';

import './AvatarWithName.css';

export type AvatarProps = {
  username: string | React.ReactNode;
  icon: React.ReactNode;
};

export default function AvatarWithName(props: AvatarProps) {
  const { icon, username } = props;
  return (
    <div className="avatar-container">
      <AntdAvatar icon={icon} />
      <div>{username}</div>
    </div>
  );
}
