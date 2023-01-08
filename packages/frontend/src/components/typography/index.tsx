import React from 'react';
import { Typography } from 'antd';

const { Title } = Typography;

export function Heading({ children, ...props }: React.ComponentProps<typeof Title>): JSX.Element {
  return (
    // Just spreading Title's own props
    // Style is added due to antd V5 adding margin on top of Title component
    // https://github.com/ant-design/ant-design/issues/40021
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Title style={{ marginTop: '0px' }} level={2} {...props}>
      {children}
    </Title>
  );
}

export function Subheading({ children, ...props }: React.ComponentProps<typeof Title>): JSX.Element {
  return (
    // Just spreading Title's own props
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Title style={{ marginTop: '0px' }} level={4} {...props}>
      {children}
    </Title>
  );
}
