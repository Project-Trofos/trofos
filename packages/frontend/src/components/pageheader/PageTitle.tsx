import React from 'react';
import { Space, Typography, Divider, theme } from 'antd';

const { Title } = Typography;

/**
 * This component renders a card containing Title, followed by a smaller subtitle. You can specify action buttons in
 * `buttons` props, an arr of react components. They will be displayed as a row of buttons.
 * You can pass in an additional component like a search component to be displayed in a divider below
 * the titles and buttons, via the `children` prop.
 */
function PageTitle({
  title,
  subTitle,
  buttons,
  children
}: {
  title: string;
  subTitle?: string;
  buttons?: React.ReactNode[];
  children?: React.ReactNode;
}) {
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
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Title style={{ margin: 0 }}>{title}</Title>
        <Space>{buttons}</Space>
      </div>
      {subTitle && <Title level={4}>{subTitle}</Title>}
      {children && <Divider />}
      {children}
    </Space>
  );
}

export default PageTitle;
