import React from 'react';
import { Space, Typography } from 'antd';
import GenericBoxWithBackground from '../layouts/GenericBoxWithBackground';

const { Title } = Typography;

/**
 * This component renders a card containing Title, followed by a smaller subtitle. You can specify action buttons in
 * `buttons` props, an arr of react components. They will be displayed as a row of buttons.
 */
function PageTitle({
  title,
  subTitle,
  buttons,
}: {
  title: string;
  subTitle?: string;
  buttons?: React.ReactNode[];
}) {
  return (
    <GenericBoxWithBackground>
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
      </GenericBoxWithBackground>
  );
}

export default PageTitle;
