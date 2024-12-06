import React from 'react';
import { Space, Tag, Typography } from 'antd';
import GenericBoxWithBackground from '../layouts/GenericBoxWithBackground';

const { Title } = Typography;

/**
 * This component renders a card containing Title, followed by a smaller subtitle. You can specify action buttons in
 * `buttons` props, an arr of react components. They will be displayed as a row of buttons.
 */
function PageHeader({
  title,
  subTitle,
  buttons,
  tagText,
  breadCrumbs,
}: {
  title: string,
  subTitle?: string,
  buttons?: React.ReactNode[],
  tagText?: string,
  breadCrumbs?: React.ReactNode,
}) {
  return (
    <GenericBoxWithBackground>
      {breadCrumbs}  
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Title style={{ margin: 0 }} level={3}>{title}</Title>
        <Space>{buttons}</Space>
      </div>
      {(subTitle || tagText) &&
        <Space>
          {subTitle && <Title level={5}>{subTitle}</Title>}
          {tagText && <Tag>{tagText}</Tag>}
        </Space>
      }
      </GenericBoxWithBackground>
  );
}

export default PageHeader;
