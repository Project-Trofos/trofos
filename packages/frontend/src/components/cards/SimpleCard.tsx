import React, { ReactNode } from 'react';
import { Card } from 'antd';

type SimpleCardProps = {
  action?: JSX.Element;
  content?: ReactNode;
};

export default function SimpleCard(props: SimpleCardProps): JSX.Element {
  return (
    <Card style={{ width: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ marginRight: 25 }}>{props.content}</div>
        {props.action}
      </div>
    </Card>
  );
}
