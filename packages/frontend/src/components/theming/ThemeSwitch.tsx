import React from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { ConfigProvider, Switch } from 'antd';
import { toggleTheme } from '../../app/localSettingsSlice';

const ThemeSwitch = () => {
  const dispatch = useAppDispatch();
  const isDarkTheme = useAppSelector((state) => state.localSettingsSlice.isDarkTheme);
  // TODO: Change icon for dark and light theme
  return (
    <ConfigProvider theme={{ token: { colorTextQuaternary: 'gray', colorPrimary: 'black' } }}>
      <Switch
        checkedChildren={'D'}
        unCheckedChildren={'L'}
        checked={isDarkTheme}
        onClick={() => dispatch(toggleTheme())}
      />
    </ConfigProvider>
  );
};

export default ThemeSwitch;
