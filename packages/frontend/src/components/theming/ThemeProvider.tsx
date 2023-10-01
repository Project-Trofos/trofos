import { ConfigProvider } from 'antd';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { theme as antdTheme } from 'antd';
import { PropsWithChildren } from 'react';

const ThemeProvider = ({ children }: PropsWithChildren) => {
  const isDarkTheme = useAppSelector((state) => state.themeSlice.isDarkTheme);

  return (
    <ConfigProvider
      theme={{
        algorithm: !isDarkTheme ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#32a2ac',
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
};

export default ThemeProvider;
