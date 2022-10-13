import React from 'react';
import { Typography } from 'antd';

const { Title } = Typography;

export function Heading({ children, ...props }: React.ComponentProps<typeof Title>): JSX.Element {
  return (
    // Just spreading Title's own props
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Title level={2} {...props}>
      {children}
    </Title>
  );
}

export function Subheading({ children, ...props }: React.ComponentProps<typeof Title>): JSX.Element {
  return (
    // Just spreading Title's own props
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Title level={4} {...props}>
      {children}
    </Title>
  );
}
