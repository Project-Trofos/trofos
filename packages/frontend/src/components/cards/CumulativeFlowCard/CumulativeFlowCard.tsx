import React from 'react';
import { Card, Tooltip, Button } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Subheading } from '../../typography';
import { CumulativeFlowDiagram } from '../../visualization/CumulativeFlowDiagram';
import { BacklogHistory } from '../../../api/types';

import './CumulativeFlowCard.css';

export default function CumulativeFlowCard(props: { backlogHistory: BacklogHistory[] }) {
  const { backlogHistory } = props;
  const tooltipText = `Shows the statuses of issues over time. 
    This helps you identify potential bottlenecks that need to be investigated.\n
    The distance between each column lines shows you how long issues take to get from one state to another. 
    Look for points where one band is growing at a faster rate than another to find bottlenecks`;
  return (
    <Card className="card">
      <div className="card-header">
        <Subheading className="card-header-text">Cumulative Flow Diagram</Subheading>
        <Tooltip title={tooltipText}>
          <Button size="small" type="text" shape="circle" icon={<QuestionCircleOutlined />} />
        </Tooltip>
      </div>
      <CumulativeFlowDiagram backlogHistory={backlogHistory} />
    </Card>
  );
}
