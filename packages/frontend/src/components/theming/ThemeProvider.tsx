import { ConfigProvider } from 'antd';
import { useAppSelector } from '../../app/hooks';
import { theme as antdTheme } from 'antd';
import { PropsWithChildren } from 'react';

const ThemeProvider = ({ children }: PropsWithChildren) => {
  const isDarkTheme = useAppSelector((state) => state.themeSlice.isDarkTheme);
  const colorPrimary = '#32A2AC';
  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkTheme ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary,
          colorLink: colorPrimary
        },
        components: {
          Layout: {
            siderBg: colorPrimary,
            headerBg: colorPrimary
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
};

export default ThemeProvider;
