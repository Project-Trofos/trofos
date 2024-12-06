import React from 'react';
import { Space, theme } from 'antd';

function GenericBoxWithBackground({
  children,
  style,
  withBorder,
  isHorizontal,
}: {
  children: React.ReactNode,
  style?: React.CSSProperties,
  withBorder?: boolean,
  isHorizontal?: boolean
}) {
  const { token } = theme.useToken();

  return (
    <Space
      direction={isHorizontal ? "horizontal" : "vertical"}
      style={{
        width: '100%',
        marginBottom: 8,
        padding: 16,
        backgroundColor: token.colorBgContainer,
        borderRadius: token.borderRadiusLG,
        boxShadow: token.boxShadowSecondary,
        border: withBorder ? `1px solid ${token.colorBorder}` : undefined,
        ...style,
      }}
    >
      {children}
    </Space>
  )
}

export default GenericBoxWithBackground;
