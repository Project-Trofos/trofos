import React from 'react';
import { Space, theme } from 'antd';

function GenericBoxWithBackground({
  children,
  style
}: { children: React.ReactNode, style?: React.CSSProperties }) {
  const { token } = theme.useToken();

  return (
    <Space
      direction="vertical"
      style={{
        width: '100%',
        marginBottom: 8,
        padding: 16,
        backgroundColor: token.colorBgContainer,
        borderRadius: token.borderRadiusLG,
        boxShadow: token.boxShadowSecondary,
        ...style,
      }}
    >
      {children}
    </Space>
  )
}

export default GenericBoxWithBackground;
