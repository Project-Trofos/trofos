import React, { useState } from 'react';
import { Card, Tooltip, Button } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Subheading } from '../../typography';
import { CumulativeFlowDiagram } from '../../visualization/CumulativeFlowDiagram';
import { BacklogHistory } from '../../../api/types';

import './CumulativeFlowCard.css';

export default function CumulativeFlowCard(props: { backlogHistory: BacklogHistory[] }) {
  const { backlogHistory } = props;
  return (
    <Card className="card">
      <div className="card-header">
        <Subheading className="card-header-text">Cumulative Flow Diagram</Subheading>
        <Tooltip title="Help">
          <Button size="small" type="text" shape="circle" icon={<QuestionCircleOutlined />} />
        </Tooltip>
      </div>
      <CumulativeFlowDiagram backlogHistory={backlogHistory} />
    </Card>
  );
}
