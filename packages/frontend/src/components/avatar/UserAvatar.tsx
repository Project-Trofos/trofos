import React from 'react';
import { Avatar, AvatarProps, Tooltip } from 'antd';

/* eslint-disable no-bitwise */
const stringToColour = (str: string): string => {
  let hash = 0;
  str.split('').forEach((char) => {
    hash = char.charCodeAt(0) + ((hash << 5) - hash);
  });
  let colour = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    colour += value.toString(16).padStart(2, '0');
  }
  return colour;
};
/* eslint-enable no-bitwise */

const BRIGHTNESS_THRESHOLD = 164;
const getContrastYIQ = (hexcolorstr: string): string => {
  const hexcolor = hexcolorstr.replace('#', '');
  const r = parseInt(hexcolor.substring(0, 2), 16);
  const g = parseInt(hexcolor.substring(2, 2), 16);
  const b = parseInt(hexcolor.substring(4, 2), 16);
  const perceivedBrightness = (r * 299 + g * 587 + b * 114) / 1000;
  return perceivedBrightness >= BRIGHTNESS_THRESHOLD ? 'black' : 'white';
};

const getInitials = (userDisplayName: string): string => {
  const names = userDisplayName.split(' ');
  let initials = names[0].substring(0, 1).toUpperCase();

  if (names.length > 1) {
    initials += names[names.length - 1].substring(0, 1).toUpperCase();
  }
  return initials;
};

interface UserAvatarProps extends AvatarProps {
  userDisplayName: string;
  userHashString: string;
}

const withColorAndTooltip = (WrappedAvatar: React.ComponentType<AvatarProps>): React.FC<UserAvatarProps> => {
  return function ({ userDisplayName, userHashString, ...restProps }: UserAvatarProps) {
    const userInitials = getInitials(userDisplayName);
    const bgColor: string = stringToColour(userHashString);
    const fontColor: string = getContrastYIQ(bgColor);
    return (
      <Tooltip title={userDisplayName}>
        <WrappedAvatar style={{ backgroundColor: bgColor, color: fontColor }} {...restProps}>
          {userInitials}
        </WrappedAvatar>
      </Tooltip>
    );
  };
};

export const UserAvatar = withColorAndTooltip(Avatar);
