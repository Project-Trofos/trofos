/* eslint-disable import/prefer-default-export */
import React from 'react';
import { Typography } from 'antd';

const { Title } = Typography;

export function Subheading({ children, ...props }: React.ComponentProps<typeof Title>): JSX.Element {
  return (
    // Just spreading Title's own props
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Title level={4} {...props}>
      {children}
    </Title>
  );
}
